import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ValidationStatusEnum } from './enum/validationStatus.enum';
import { UserDocument } from './user.schema';
@Schema()
export class ValidationDocument extends Document {
  @Prop({ type: String, enum: ValidationStatusEnum, required: true })
  status!: ValidationStatusEnum;

  @Prop({ required: false })
  comment?: string;

  @Prop({ type: String, ref: UserDocument.name, required: true })
  user?: UserDocument;
}

export const ValidationSchema =
  SchemaFactory.createForClass(ValidationDocument);
