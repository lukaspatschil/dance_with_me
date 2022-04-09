import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserDocument extends Document {
  @Prop({ required: true })
  displayName!: string;

  @Prop()
  firstName!: number;

  @Prop()
  lastName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop()
  emailVerified!: boolean;

  @Prop()
  pictureUrl!: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
