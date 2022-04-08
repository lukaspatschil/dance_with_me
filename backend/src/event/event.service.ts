import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class EventService {
  constructor(@InjectConnection() private connection: Connection) {}

  getEvents(): string {
    return 'Hello Event';
  }
}
