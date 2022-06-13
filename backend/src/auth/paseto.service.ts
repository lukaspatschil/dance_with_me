import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { V4 as paseto, ProduceOptions, decode } from 'paseto';
import { ConfigService } from '@nestjs/config';
import { randomBytes, KeyObject } from 'crypto';
import { pasetoKeyRotationInterval } from './constants';
import { setWeakTimeout } from '../core/util';
import { PasetoPayload, PasetoPayloadInput } from './interfaces';

@Injectable()
export class PasetoService implements OnModuleInit {
  private readonly logger = new Logger(PasetoService.name);

  private readonly keys: { [id: string]: { key: KeyObject; expires: number } } =
    {};

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.addNewKey();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(this.addNewKey, pasetoKeyRotationInterval);
    interval.unref();
  }

  private async addNewKey(): Promise<{ kid: string; key: KeyObject }> {
    const key = await paseto.generateKey('public');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const kid = randomBytes(16).toString('base64url');
    const expires = Date.now() + pasetoKeyRotationInterval / 2;

    this.keys[kid] = { key, expires };
    this.logger.log(`Added new key ${kid}`);

    setWeakTimeout(() => {
      delete this.keys[kid];
      this.logger.log(`Deleted key ${kid}`);
    }, pasetoKeyRotationInterval);

    return { kid, key };
  }

  private async getNewestKey(): Promise<{ kid: string; key: KeyObject }> {
    const newestKey = Object.entries(this.keys).reduce(
      (acc, [kid, key]) => {
        if (key.expires > acc.expires) {
          return { kid, ...key };
        }
        return acc;
      },
      { kid: '', key: {} as KeyObject, expires: 0 },
    );

    return newestKey.expires > Date.now() ? newestKey : this.addNewKey();
  }

  private getKeyByKid(kid: string): KeyObject {
    const key = this.keys[kid];
    if (!key) {
      throw new Error(`Key with kid ${kid} not found`);
    }
    return key.key;
  }

  async createToken(payload: PasetoPayloadInput): Promise<string> {
    const { kid, key } = await this.getNewestKey();

    const options: ProduceOptions = {
      expiresIn: '15m',
      issuer: this.configService.get('API_BASE'),
      audience: this.configService.get('FRONTEND_URL'),
      kid,
    };

    return paseto.sign(payload, key, options);
  }

  async verifyToken(token: string): Promise<PasetoPayload> {
    const { kid } = <PasetoPayload>decode(token).payload;
    const key = this.getKeyByKid(kid);

    const options = {
      issuer: this.configService.get('API_BASE'),
      audience: this.configService.get('FRONTEND_URL'),
      clockTolerance: '1m',
    };

    const payload = <PasetoPayload>await paseto.verify(token, key, options);
    if (!payload.exp) {
      throw new Error('Token has no expiry claim');
    }
    return payload;
  }
}
