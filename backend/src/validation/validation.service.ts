import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileEntity } from '../core/entity/file.entity';
import { ValidationEntity } from '../core/entity/validation.entity';
import { ValidationStatusEnum } from '../core/schema/enum/validationStatus.enum';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ValidationDocument } from '../core/schema/validation.schema';
import { InjectS3, S3 } from 'nestjs-s3';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { ConfigService } from '@nestjs/config';
import { ValidationMapper } from '../core/mapper/validation.mapper';
import { NotFoundError } from '../core/error/notFound.error';
import { UserDocument } from '../core/schema/user.schema';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { ImageService } from '../image/image.service';
import { ValidationRequestAlreadyExistsError } from '../core/error/validationRequestAlreadyExists.error';
import { ValidationRequestAlreadyResponded } from '../core/error/validationRequestAlreadyResponded';

@Injectable()
export class ValidationService {
  private readonly validationFolder = 'validation';

  private readonly logger = new Logger(ValidationService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(ValidationDocument.name)
    private readonly validationModel: Model<ValidationDocument>,
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
    @InjectS3() private readonly s3: S3,
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
  ) {}

  public async createValidation(
    file: FileEntity,
    userId: string,
  ): Promise<string> {
    const bucketName =
      this.configService.get('BUCKET_NAME_PREFIX') +
      this.configService.get('STAGE');

    const openRequest = await this.validationModel
      .exists({ user: userId })
      .exec();
    if (openRequest) {
      throw ValidationRequestAlreadyExistsError;
    }

    const session = await this.validationModel.startSession();
    session.startTransaction();
    let response;
    try {
      response = await this.validationModel.create({
        status: ValidationStatusEnum.PENDING,
        user: userId,
      });
      const config: PutObjectRequest = {
        Bucket: bucketName,
        Key: `${this.validationFolder}/${response._id}`,
        Body: file.buffer,
        ContentEncoding: file.encoding,
        ContentType: file.mimetype,
      };
      await this.s3.putObject(config).promise();
      await session.commitTransaction();
    } catch (e) {
      this.logger.error(e);
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      await session.endSession();
    }
    const responseId: string = response._id;
    return responseId;
  }

  public async deleteValidationsByUser(userId: string) {
    const validations = await this.getValidationForUser(userId);
    for (const validation of validations) {
      await this.deleteValidation(validation.id);
    }
  }

  public async getValidationForUser(
    userId: string,
  ): Promise<Omit<ValidationEntity, 'comment'>[]> {
    try {
      const response = await this.validationModel
        .find({
          user: userId,
        })
        .populate('user')
        .exec();
      return response
        .map<ValidationEntity>(ValidationMapper.mapDocumentToEntity)
        .map(({ comment, ...rest }) => rest);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  public async getValidationList(
    validationStatus: ValidationStatusEnum,
  ): Promise<ValidationEntity[]> {
    let response;
    try {
      response = await this.validationModel
        .find({
          status: validationStatus,
        })
        .populate('user')
        .exec();
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return response.map<ValidationEntity>(ValidationMapper.mapDocumentToEntity);
  }

  public async updateValidation(
    id: string,
    status: ValidationStatusEnum,
    comment?: string,
  ): Promise<ValidationEntity> {
    let validationEntity;
    try {
      const validationDocument = await this.validationModel
        .findById(id)
        .populate('user')
        .exec();
      validationEntity = validationDocument
        ? ValidationMapper.mapDocumentToEntity(validationDocument)
        : null;
    } catch (e) {
      throw new InternalServerErrorException();
    }
    if (!validationEntity) {
      throw NotFoundError;
    }

    const alreadyResponded =
      status !== ValidationStatusEnum.PENDING &&
      (validationEntity.status === ValidationStatusEnum.REJECTED ||
        validationEntity.status === ValidationStatusEnum.APPROVED);
    if (alreadyResponded) {
      this.logger.error(
        `Admin tried to change an already approved or rejected validation.`,
      );
      throw ValidationRequestAlreadyResponded;
    }

    const validationAttributes: {
      [key: string]: ValidationStatusEnum | string | undefined;
    } = {
      status: status,
      comment: comment,
    };
    Object.keys(validationAttributes).forEach((key) =>
      validationAttributes[key] === undefined
        ? delete validationAttributes[key]
        : {},
    );
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      if (status === ValidationStatusEnum.APPROVED) {
        await this.userModel
          .findByIdAndUpdate(validationEntity.user.id, {
            role: RoleEnum.ORGANISER,
          })
          .exec();
      }

      const response = await this.validationModel
        .findByIdAndUpdate(id, { $set: validationAttributes }, { new: true })
        .populate('user')
        .exec();

      await session.commitTransaction();
      if (response) {
        return ValidationMapper.mapDocumentToEntity(response);
      }
    } catch (e) {
      this.logger.error(
        `Error during the upgrade from role user to organiser for id ${id}`,
      );
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      await session.endSession();
    }

    throw NotFoundError;
  }

  public async deleteValidation(id: string) {
    const bucketName =
      this.configService.get('BUCKET_NAME_PREFIX') +
      this.configService.get('STAGE');
    let response;
    const session = await this.validationModel.startSession();
    try {
      session.startTransaction();
      response = await this.validationModel.findByIdAndDelete(id).exec();
      const config = {
        Key: `${this.validationFolder}/${id}`,
        Bucket: bucketName,
      };
      await this.s3.deleteObject(config).promise();
      await session.commitTransaction();
    } catch (e) {
      this.logger.error(e);
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      await session.endSession();
    }
    return response;
  }

  async getValidationImage(id: string) {
    const key = `${this.validationFolder}/${id}`;
    return this.imageService.getImage(key);
  }
}
