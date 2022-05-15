import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../core/schema/user.schema';
import { Document, Model } from 'mongoose';
import { UserEntity } from '../core/entity/user.entity';
import { UserMapper } from '../core/mapper/user.mapper';
import { RoleEnum } from '../core/schema/enum/role.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async deleteUser(userId: string): Promise<UserDocument | null> {
    this.logger.log(`Delete user with id: ${userId}`);
    try {
      return await this.userModel.findByIdAndDelete(userId);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async findAndUpdateOrCreate(
    user: Required<Pick<UserEntity, 'id'>> & Omit<UserEntity, 'role'>,
  ): Promise<UserEntity> {
    this.logger.log(`Find or create user with id: ${user.id}`);
    const { id: userId, ...userAttributes } = user;
    const userDoc = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: userAttributes },
      { upsert: true, new: true },
    );
    if (userDoc) {
      this.logger.log(`Found user with id: ${user.id}`);
      return UserMapper.mapDocumentToEntity(userDoc);
    }
    const newUser: Omit<UserDocument, keyof Omit<Document, '_id'>> = {
      _id: userId,
      ...userAttributes,
      role: RoleEnum.USER,
    };
    const newUserDoc = await this.userModel.create(newUser);
    this.logger.log(`Created user with id: ${user.id}`);
    return UserMapper.mapDocumentToEntity(newUserDoc);
  }
}
