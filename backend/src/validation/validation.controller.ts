import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ValidationService } from './validation.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../image/multer.config';
import { Express } from 'express';
import { User } from '../auth/user.decorator';
import { Admin } from '../auth/role.guard';
import { ValidationStatusDto } from '../core/dto/validationStatus.dto';
import { ValidationResponseDto } from '../core/dto/validationResponse.dto';
import { FileMapper } from '../core/mapper/file.mapper';
import { ValidationMapper } from '../core/mapper/validation.mapper';
import { NotFoundError } from '../core/error/notFound.error';
import { UpdateValidationDto } from '../core/dto/updateValidation.dto';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { MissingPermissionError } from '../core/error/missingPermission.error';
import { AuthUser } from '../auth/interfaces';

@Controller('validationrequest')
export class ValidationController {
  private readonly logger = new Logger(ValidationController.name);

  constructor(private readonly validationService: ValidationService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  public async createValidation(
    @UploadedFile() file: Express.Multer.File,
    @User() user: AuthUser,
  ) {
    if (user.role !== RoleEnum.USER) {
      throw MissingPermissionError;
    }
    const idResponse = await this.validationService.createValidation(
      FileMapper.mapFileToEntity(file),
      user.id,
    );
    return {
      id: idResponse,
    };
  }

  @Get()
  public async getValidationList(
    @Query() validationStatus: ValidationStatusDto,
    @User() user: AuthUser,
  ): Promise<ValidationResponseDto[]> {
    if (user.role === RoleEnum.ADMIN) {
      const response = await this.validationService.getValidationList(
        validationStatus.status,
      );
      return response.map<ValidationResponseDto>(
        ValidationMapper.mapEntityToDto,
      );
    } else {
      const response = await this.validationService.getValidationForUser(
        user.id,
      );
      return response.map<ValidationResponseDto>(
        ValidationMapper.mapEntityToDto,
      );
    }
  }

  @Patch(':id')
  @Admin()
  public async updateValidation(
    @Param('id') id: string,
    @Body() updateValidation: UpdateValidationDto,
  ): Promise<ValidationResponseDto> {
    const response = await this.validationService.updateValidation(
      id,
      updateValidation.status,
      updateValidation.comment,
    );
    return ValidationMapper.mapEntityToDto(response);
  }

  @Delete(':id')
  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteValidation(@Param('id') id: string): Promise<void> {
    const result = await this.validationService.deleteValidation(id);
    if (result === null) {
      throw NotFoundError;
    }
  }

  @Get(':id/image')
  @Admin()
  public async getValidationImage(
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const response = await this.validationService.getValidationImage(id);
    return new StreamableFile(response.body, { type: response.contentType });
  }
}
