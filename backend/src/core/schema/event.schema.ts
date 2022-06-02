import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LocationDocument } from './location.schema';
import { AddressDocument } from './address.schema';
import { CategoryEnum } from './enum/category.enum';
import { UserDocument } from './user.schema';

@Schema()
export class EventDocument extends Document {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String })
  description!: string;

  @Prop({ required: true, type: Date })
  startDateTime!: Date;

  @Prop({ required: true, type: Date })
  endDateTime!: Date;

  @Prop(LocationDocument)
  location!: LocationDocument;

  @Prop(AddressDocument)
  address!: AddressDocument;

  @Prop({ required: true, type: Number })
  price!: number;

  @Prop({ required: true, type: Boolean })
  public!: boolean;

  @Prop({ required: false, type: String })
  imageId?: string;

  @Prop({ required: true, type: String })
  organizerId!: string;

  @Prop({ required: true })
  organizerName!: string;

  @Prop({ type: [String], required: true })
  category!: CategoryEnum[];

  @Prop({
    type: [{ type: String, ref: UserDocument.name }],
  })
  participants!: string[];

  @Prop({ type: Boolean, default: false })
  paid!: boolean;
}

export const EventSchema = SchemaFactory.createForClass(EventDocument).index({
  location: '2dsphere',
});
