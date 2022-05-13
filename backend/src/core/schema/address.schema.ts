import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AddressDocument extends Document {
  @Prop({ required: true })
  country!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  postalcode!: string;

  @Prop({ required: true })
  street!: string;

  @Prop()
  housenumber?: string;

  @Prop()
  addition?: string;
}
