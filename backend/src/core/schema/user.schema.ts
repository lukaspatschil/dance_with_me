import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RoleEnum } from './enum/role.enum';

@Schema()
export class UserDocument extends Document {
  @Prop({ required: true, type: String })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  override _id!: string;

  @Prop({ required: true, type: String })
  role!: RoleEnum;

  @Prop({ required: true, type: String })
  displayName!: string;

  @Prop({ required: false, type: String })
  firstName?: string;

  @Prop({ required: false, type: String })
  lastName?: string;

  @Prop({ required: true, type: String })
  email!: string;

  @Prop({ required: false, type: Boolean, default: false })
  emailVerified!: boolean;

  @Prop({ required: false, type: String })
  pictureUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
