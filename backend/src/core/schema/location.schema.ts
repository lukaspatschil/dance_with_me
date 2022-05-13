import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GeolocationEnum } from './enum/geolocation.enum';

@Schema()
export class LocationDocument extends Document {
  @Prop({ type: String, enum: [GeolocationEnum.POINT], required: true })
  type!: GeolocationEnum;

  @Prop([Number])
  coordinates!: [number, number];
}

export const LocationSchema = SchemaFactory.createForClass(LocationDocument);
