import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserMapper } from '../core/mapper/user.mapper';
import { User } from '../auth/user.decorator';
import { AuthUser } from '../auth/interfaces';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { MissingPermissionError } from '../core/error/missingPermission.error';
import { NotFoundError } from '../core/error/notFound.error';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    this.logger.log(`Delete user with id: ${id}`);
    const result = await this.userService.deleteUser(id);
    if (result === null) {
      throw NotFoundError;
    }
    this.logger.log(`User with id: ${id} was deleted`);
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @User() user: AuthUser) {
    this.logger.log(`Get user with id: ${id}`);
    if (user.id === id || user.role === RoleEnum.ADMIN) {
      return UserMapper.mapEntityToDto(await this.userService.getUser(id));
    }
    throw MissingPermissionError;
  }
}
