import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LocationDocument } from './location.schema';
import { AddressDocument } from './address.schema';
import { CategoryEnum } from './enum/category.enum';
import { UserDocument } from './user.schema';

@Schema()
export class EventDocument extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  startDateTime!: Date;

  @Prop({ required: true })
  endDateTime!: Date;

  @Prop(LocationDocument)
  location!: LocationDocument;

  @Prop(AddressDocument)
  address!: AddressDocument;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  public!: boolean;

  @Prop({ required: false })
  imageId?: string;

  @Prop({ required: true })
  organizerId!: string;

  @Prop({ type: [String], required: true })
  category!: CategoryEnum[];

  @Prop({
    type: [{ type: String, ref: UserDocument.name }],
  })
  participants!: string[];
}

export const EventSchema = SchemaFactory.createForClass(EventDocument).index({
  location: '2dsphere',
});
