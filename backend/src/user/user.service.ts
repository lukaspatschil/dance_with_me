import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../core/schema/user.schema';
import { Model } from 'mongoose';

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
      const user = await this.userModel.findByIdAndDelete(userId);
      return user;
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
