import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDocument } from './user.schema';

@Schema()
export class RefreshTokenDocument extends Document {
  @Prop({ required: true })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  override _id!: string;

  @Prop({ required: true })
  fingerprint!: string;

  @Prop({ type: String, ref: UserDocument.name })
  user!: UserDocument;
}

export const RefreshTokenSchema =
  SchemaFactory.createForClass(RefreshTokenDocument);
