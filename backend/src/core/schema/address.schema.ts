import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AddressDocument extends Document {
  @Prop({ required: true, type: String })
  country!: string;

  @Prop({ required: true, type: String })
  city!: string;

  @Prop({ required: true, type: String })
  postalcode!: string;

  @Prop({ required: true, type: String })
  street!: string;

  @Prop({ required: false, type: String })
  housenumber?: string;

  @Prop({ required: false, type: String })
  addition?: string;
}
