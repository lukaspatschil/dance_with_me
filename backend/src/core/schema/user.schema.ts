import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RoleEnum } from './enum/role.enum';

@Schema()
export class UserDocument extends Document {
  @Prop({ required: true })
  override _id!: string;

  @Prop({ required: true })
  role!: RoleEnum;

  @Prop({ required: true })
  displayName!: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  email!: string;

  @Prop()
  emailVerified!: boolean;

  @Prop()
  pictureUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
