import { FileMapper } from '../../../../src/core/mapper/file.mapper';
import {
  getDefaultUserImageTest,
  validCreated,
  validFileDto,
  validFileEntity,
  validFileEntityResponse,
  validFileMulter,
} from '../../../test_data/image.testData';

describe('FileMapper', () => {
  describe('mapEntityToDto', () => {
    it('should return correct Dto', () => {
      // Given
      const fileEntity = validFileEntityResponse();
      const fileDto = validFileDto();
      const userId = getDefaultUserImageTest().id;
      Date.now = jest.fn(() => validCreated);

      // When
      const result = FileMapper.mapEntityToDto(fileEntity, userId);

      // Then
      expect(result).toEqual(fileDto);
    });
  });

  describe('mapFileToEntity', () => {
    it('should return correct Entity', () => {
      // Given
      const fileMulter = validFileMulter();
      const fileEntity = validFileEntity();
      Date.now = jest.fn(() => validCreated);

      // When
      const result = FileMapper.mapFileToEntity(fileMulter);

      // Then
      expect(result).toEqual(fileEntity);
    });
  });
});
