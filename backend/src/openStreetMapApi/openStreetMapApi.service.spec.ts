import { Test, TestingModule } from '@nestjs/testing';
import { OpenStreetMapApiService } from './openStreetMapApi.service';
import { HttpService } from '@nestjs/axios';
import { OpenStreetMapApiAxiosMock } from '../../test/stubs/openStreetMapApi.axios.mock';
import {
  badRequestAddress,
  invalidAddress,
  invalidTokenLatitude,
  invalidTokenLongitude,
  noCountryLatitude,
  noCountryLongitude,
  validAddress,
  validLatitude,
  validLongitude,
} from '../../test/test_data/openStreetMapApi.testData';
import { ConfigService } from '@nestjs/config';
import { ConfigMock } from '../../test/stubs/config.mock';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('PositionStackService', () => {
  let sut: OpenStreetMapApiService;
  let positionStackAxios: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HttpService,
          useClass: OpenStreetMapApiAxiosMock,
        },
        {
          provide: ConfigService,
          useClass: ConfigMock,
        },
        OpenStreetMapApiService,
      ],
    }).compile();

    sut = module.get<OpenStreetMapApiService>(OpenStreetMapApiService);
    positionStackAxios = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getAddress', () => {
    it('should call the httpService', async () => {
      // When
      await sut.getAddress(validLongitude, validLatitude);

      // Then
      expect(positionStackAxios.get).toHaveBeenCalled();
    });

    it('should call the service and throw a NotFoundException', async () => {
      // When
      const result = async () =>
        await sut.getAddress(noCountryLongitude, noCountryLatitude);

      // Then
      await expect(result).rejects.toThrow(new NotFoundException());
    });

    it('should call the service and throw a InternalServerErrorException', async () => {
      // When
      const result = async () =>
        await sut.getAddress(invalidTokenLongitude, invalidTokenLatitude);

      // Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });
  });

  describe('getLocationPoint', () => {
    it('should call the httpService', async () => {
      // When
      await sut.getLocationPoint(validAddress);

      // Then
      expect(positionStackAxios.get).toHaveBeenCalled();
    });

    it('should call the service and throw a NotFoundException', async () => {
      // When
      const result = async () => await sut.getLocationPoint(invalidAddress);

      // Then
      await expect(result).rejects.toThrow(new NotFoundException());
    });

    it('should call the service and throw a InternalServerErrorException', async () => {
      // When
      const result = async () => await sut.getLocationPoint(badRequestAddress);

      // Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });
  });
});
