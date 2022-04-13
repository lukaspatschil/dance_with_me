import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ required: true })
  longitude!: string;

  @Prop({ required: true })
  latitude!: string;

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

export const EventSchema = SchemaFactory.createForClass(EventDocument);
