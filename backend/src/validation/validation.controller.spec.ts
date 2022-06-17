import { Test, TestingModule } from '@nestjs/testing';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';
import { ValidationServiceMock } from '../../test/stubs/validation.service.mock';
import { validFileMulter } from '../../test/test_data/image.testData';
import { validObjectId } from '../../test/test_data/user.testData';
import { ValidationStatusDto } from '../core/dto/validationStatus.dto';
import {
  getDefaultUserValidationTest1,
  invalidValidationId,
  validationId1,
  validUpdateValidationDtoApproved,
  validValidationDto1,
  validValidationDtoList,
} from '../../test/test_data/validation.testData';
import { NotFoundException, StreamableFile } from '@nestjs/common';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { MissingPermissionError } from '../core/error/missingPermission.error';

describe('ValidationController', () => {
  let sut: ValidationController;
  let validationMock: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ValidationService,
          useClass: ValidationServiceMock,
        },
      ],
      controllers: [ValidationController],
    }).compile();

    sut = module.get<ValidationController>(ValidationController);
    validationMock = module.get<ValidationService>(ValidationService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('createValidation', () => {
    it('should not allow organizers to create new validation requests', async () => {
      const authUser = {
        ...getDefaultUserValidationTest1(),
        role: RoleEnum.ORGANISER,
      };

      //WHEN
      const result = sut.createValidation(validFileMulter(), authUser);

      //THEN
      await expect(result).rejects.toThrow(MissingPermissionError);
    });

    it('should return a valid id', async () => {
      //WHEN
      const result = await sut.createValidation(
        validFileMulter(),
        getDefaultUserValidationTest1(),
      );

      //THEN
      expect(result).toEqual({ id: validObjectId.toString() });
    });

    it('should call createValidation', async () => {
      //WHEN
      await sut.createValidation(
        validFileMulter(),
        getDefaultUserValidationTest1(),
      );

      //THEN
      expect(validationMock.createValidation).toBeCalled();
    });
  });

  describe('getValidationList', () => {
    it('should return a valid list of ValidationDto', async () => {
      //GIVEN
      const dto = new ValidationStatusDto();
      const authUser = {
        ...getDefaultUserValidationTest1(),
        role: RoleEnum.ADMIN,
      };

      //WHEN
      const result = await sut.getValidationList(dto, authUser);

      //THEN
      expect(result).toEqual(validValidationDtoList());
    });

    it('should return a user their own validation request', async () => {
      //GIVEN
      const dto = new ValidationStatusDto();
      const authUser = getDefaultUserValidationTest1();

      //WHEN
      const result = await sut.getValidationList(dto, authUser);

      //THEN
      expect(result).toEqual([validValidationDto1()]);
    });

    it('should call getValidationList', async () => {
      //GIVEN
      const dto = new ValidationStatusDto();
      const authUser = {
        ...getDefaultUserValidationTest1(),
        role: RoleEnum.ADMIN,
      };

      //WHEN
      await sut.getValidationList(dto, authUser);

      //THEN
      expect(validationMock.getValidationList).toBeCalled();
    });

    it('should call getValidationForUser if request is not made by admin', async () => {
      //GIVEN
      const dto = new ValidationStatusDto();
      const authUser = getDefaultUserValidationTest1();

      //WHEN
      await sut.getValidationList(dto, authUser);

      //THEN
      expect(validationMock.getValidationForUser).toBeCalled();
    });
  });

  describe('updateValidation', () => {
    it('should return a valid list of ValidationDto', async () => {
      //WHEN
      const result = await sut.updateValidation(
        validationId1,
        validUpdateValidationDtoApproved(),
      );

      //THEN
      expect(result).toEqual(validValidationDto1());
    });

    it('should call createValidation', async () => {
      //WHEN
      await sut.updateValidation(
        validationId1,
        validUpdateValidationDtoApproved(),
      );

      //THEN
      expect(validationMock.updateValidation).toBeCalled();
    });
  });

  describe('getValidationImage', () => {
    it('should call createValidation', async () => {
      //WHEN
      const result = await sut.getValidationImage(validationId1);

      //THEN
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('deleteValidation', () => {
    it('should call deleteValidation', async () => {
      //WHEN
      await sut.deleteValidation(validationId1);

      //THEN
      expect(validationMock.deleteValidation).toBeCalled();
    });

    it('should call createValidation', async () => {
      //WHEN
      const result = async () => {
        await sut.deleteValidation(invalidValidationId);
      };

      //THEN
      await expect(result).rejects.toThrow(NotFoundException);
    });
  });
});
