import { Test, TestingModule } from '@nestjs/testing';
import { PasetoService } from './paseto.service';
import { ConfigService } from '@nestjs/config';
import { pasetoKeyRotationInterval } from './constants';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { V4, decode } from 'paseto';
import { PasetoPayload } from './interfaces';
/* eslint @typescript-eslint/no-magic-numbers: 0 */
describe('PasetoService', () => {
  let service: PasetoService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasetoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return {
                API_BASE: 'mock-api-base',
                FRONTEND_URL: 'mock-frontend-url',
              }[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PasetoService>(PasetoService);
    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rotation', () => {
    jest.spyOn(global, 'setInterval');
    jest.spyOn(PasetoService.prototype as any, 'addNewKey');

    it('should immediately add new key', async () => {
      // When
      // Lifecycle hooks are not called during instantiation in unit tests
      await service.onModuleInit();

      // Then
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(service.addNewKey).toHaveBeenCalled();
    });

    it('should set up interval for adding new keys', async () => {
      // When
      // Lifecycle hooks are not called during instantiation in unit tests
      await service.onModuleInit();

      // Then
      expect(setInterval).toHaveBeenLastCalledWith(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        service.addNewKey,
        pasetoKeyRotationInterval,
      );
    });
  });

  describe('addNewKey', () => {
    it('should add a new key', async () => {
      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newKey = await service.addNewKey();

      // Then
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(Object.keys(service.keys)).toContain(newKey.kid);
    });

    it('should set up a timeout', async () => {
      jest.spyOn(global, 'setTimeout');

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await service.addNewKey();

      // Then
      expect(setTimeout).toHaveBeenCalled();
    });

    it('should remove keys after timeout', async () => {
      jest.useFakeTimers('legacy');

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid } = await service.addNewKey();
      jest.advanceTimersByTime(pasetoKeyRotationInterval * 2);

      // Then
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(service.keys[kid]).toBeUndefined();
      jest.useRealTimers();
    });
  });

  describe('getNewestKey', () => {
    it('should not get old key', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid } = await service.addNewKey();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const oldKey = { kid, ...service.keys[kid] };
      await new Promise((resolve) => setTimeout(resolve, 1));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await service.addNewKey();

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newestKey = await service.getNewestKey();

      // Then
      expect(newestKey).not.toEqual(oldKey);
    });

    it('should get newest key', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await service.addNewKey();
      await new Promise((resolve) => setTimeout(resolve, 1));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid } = await service.addNewKey();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newKey = { kid, ...service.keys[kid] };

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newestKey = await service.getNewestKey();

      // Then
      expect(newestKey).toEqual(newKey);
    });

    it('should not get key wih old kid', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid } = await service.addNewKey();
      await new Promise((resolve) => setTimeout(resolve, 1));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await service.addNewKey();

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newestKey = await service.getNewestKey();

      // Then
      expect(newestKey).toEqual(expect.not.objectContaining({ kid }));
    });

    it('should get newest key', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newKey = await service.addNewKey();
      await new Promise((resolve) => setTimeout(resolve, 1));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const anotherKey = await service.addNewKey();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      service.keys[anotherKey.kid] = { ...anotherKey, expires: 1 };

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newestKey = await service.getNewestKey();

      // Then
      expect(newestKey).toEqual(expect.objectContaining(newKey));
    });

    it('should create new key if none existed', async () => {
      const addNewKeySpy = jest.spyOn(service as any, 'addNewKey');

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await service.getNewestKey();

      // Then
      expect(addNewKeySpy).toHaveBeenCalled();
    });

    it('should create new key if newest is expired', async () => {
      const addNewKeySpy = jest.spyOn(service as any, 'addNewKey');

      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newKey = service.keys[(await service.addNewKey()).kid];
      if (newKey) newKey.expires = new Date().getTime() - 1;

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await service.getNewestKey();

      // Then
      expect(addNewKeySpy).toHaveBeenCalled();
    });
  });

  describe('getKeyByKid', () => {
    it('should get key by kid', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid } = await service.addNewKey();

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const key = service.getKeyByKid(kid);

      // Then
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(key).toEqual(service.keys[kid]?.key);
    });

    it('should throw error if key does not exist', () => {
      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const promise = () => service.getKeyByKid('??');

      // Then
      expect(promise).toThrow();
    });
  });

  const minimalPayload = {
    fingerPrintHash: 'fingerprint',
    role: RoleEnum.USER,
    displayName: 'displayName',
  };

  describe('createToken', () => {
    it('should create a token that can be decoded by paseto', async () => {
      // When
      const token = await service.createToken(minimalPayload);

      // Then
      expect(decode(token)).toBeTruthy();
    });

    it('should create a token with correct payload', async () => {
      // When
      const token = await service.createToken(minimalPayload);

      // Then
      expect(decode(token).payload).toEqual(
        expect.objectContaining(minimalPayload),
      );
    });

    it('should return token that can be decoded with provided kid', async () => {
      // Given
      const token = await service.createToken(minimalPayload);
      const { kid } = decode(token).payload as PasetoPayload;

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const key = service.getKeyByKid(kid);

      // Then
      expect(await V4.verify(token, key)).toEqual(
        expect.objectContaining(minimalPayload),
      );
    });
  });

  const completePayload = (kid: string) => ({
    ...minimalPayload,
    kid,
    aud: config.get('FRONTEND_URL'),
    iss: config.get('API_BASE'),
    exp: new Date(Date.now() + 1000 * 60).toISOString(),
  });

  describe('verifyToken', () => {
    it('should verify a token created by paseto with existing key', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid, key } = await service.getNewestKey();
      const token = await V4.sign(completePayload(kid), key);

      // When
      const payload = await service.verifyToken(token);

      // Then
      expect(payload).toEqual(expect.objectContaining(minimalPayload));
    });

    it('should throw error if audience does not match', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid, key } = await service.getNewestKey();
      const payload = { ...completePayload(kid), aud: '??' };
      const token = await V4.sign(payload, key);

      // When
      const promise = service.verifyToken(token);

      // Then
      await expect(promise).rejects.toThrow();
    });

    it('should throw error if issuer does not match', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid, key } = await service.getNewestKey();
      const payload = { ...completePayload(kid), iss: '??' };
      const token = await V4.sign(payload, key);

      // When
      const promise = service.verifyToken(token);

      // Then
      await expect(promise).rejects.toThrow();
    });

    it('should throw error if kid does not exist', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { key } = await service.getNewestKey();
      const payload = { ...completePayload('??') };
      const token = await V4.sign(payload, key);

      // When
      const promise = service.verifyToken(token);

      // Then
      await expect(promise).rejects.toThrow();
    });

    it('should throw error if signature does not match kid', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid } = await service.getNewestKey();
      const payload = { ...completePayload(kid) };
      const token = await V4.sign(payload, await V4.generateKey('public'));

      // When
      const promise = service.verifyToken(token);

      // Then
      await expect(promise).rejects.toThrow();
    });

    it('should throw error if token does not contain expiry claim', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid, key } = await service.getNewestKey();
      const payload = { ...completePayload(kid), exp: undefined };
      const token = await V4.sign(payload, key);

      // When
      const promise = service.verifyToken(token);

      // Then
      await expect(promise).rejects.toThrow();
    });

    it('should throw error if token is expired', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { kid, key } = await service.getNewestKey();
      const payload = {
        ...completePayload(kid),
        exp: new Date(Date.now() - 1000 * 60 * 60),
      };
      const token = await V4.sign(payload, key);

      // When
      const promise = service.verifyToken(token);

      // Then
      await expect(promise).rejects.toThrow();
    });
  });
});
