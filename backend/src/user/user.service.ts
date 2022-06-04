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
import { NotFoundError } from '../core/error/notFound.error';
import { EventService } from '../event/event.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly eventService: EventService,
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async deleteUser(userId: string): Promise<UserDocument | null> {
    this.logger.log(`Delete user with id: ${userId}`);
    let result;
    try {
      result = await this.userModel.findByIdAndDelete(userId);
      await this.eventService.deleteUsersFromFutureEvents(userId);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    return result;
  }

  async findAndUpdateOrCreate(
    user: Omit<UserEntity, 'role'> & Required<Pick<UserEntity, 'id'>>,
  ): Promise<UserEntity> {
    this.logger.log(`Find or create user with id: ${user.id}`);
    const { id: userId, ...userAttributes } = user;
    const userDoc = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: userAttributes },
      { new: true },
    );
    if (userDoc) {
      this.logger.log(`Found user with id: ${user.id}`);
      return UserMapper.mapDocumentToEntity(userDoc);
    }
    const newUser: Omit<UserDocument, keyof Omit<Document, '_id'>> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: userId,
      ...userAttributes,
      role: RoleEnum.USER,
    };
    const newUserDoc = await this.userModel.create(newUser);
    this.logger.log(`Created user with id: ${user.id}`);
    return UserMapper.mapDocumentToEntity(newUserDoc);
  }

  async getUser(id: string): Promise<UserEntity> {
    this.logger.log(`Get user with id: ${id}`);
    let user;
    try {
      user = await this.userModel.findById(id);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    if (user === null) {
      throw NotFoundError;
    }
    this.logger.log('Result: ' + JSON.stringify(user));
    return UserMapper.mapDocumentToEntity(user);
  }
}
