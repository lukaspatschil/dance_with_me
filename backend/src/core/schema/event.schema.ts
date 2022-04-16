import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LocationDocument } from './location.schema';

@Schema()
export class EventDocument extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop(LocationDocument)
  location!: LocationDocument;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  isPublic!: boolean;

  @Prop({ required: true })
  imageId!: string;

  @Prop({ required: true })
  organizerId!: string;

  @Prop({ required: true })
  category!: string;
}

const EventSchema = SchemaFactory.createForClass(EventDocument);
EventSchema.index({ location: '2dsphere' });
export { EventSchema };
