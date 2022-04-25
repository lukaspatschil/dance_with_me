import {
  Controller,
  Delete,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    this.logger.log(`Delete user with id: ${id}`);
    if ((await this.userService.deleteUser(id)) === null) {
      throw new NotFoundException();
    }
    this.logger.log(`User with id: ${id} was deleted`);
  }
}
