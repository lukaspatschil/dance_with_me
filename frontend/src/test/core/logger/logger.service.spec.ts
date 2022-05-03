import { TestBed } from '@angular/core/testing';
import { LoggerService } from '../../../app/core/logger/logger.service';

describe('LoggerService', () => {
  let sut: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sut = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('log', () => {
    it('should log a message', () => {
      // Given
      const message = 'test';
      jest.spyOn(console, 'log').mockImplementation();

      // When
      sut.log(message);

      // Then
      expect(console.log).toHaveBeenCalledWith(message);
    });
  });

  describe('error', () => {
    it('should log a message', () => {
      // Given
      const message = 'test';
      jest.spyOn(console, 'error').mockImplementation();

      // When
      sut.error(message);

      // Then
      expect(console.error).toHaveBeenCalledWith(message);
    });
  });

  describe('warn', () => {
    it('should log a message', () => {
      // Given
      const message = 'test';
      jest.spyOn(console, 'warn').mockImplementation();

      // When
      sut.warn(message);

      // Then
      expect(console.warn).toHaveBeenCalledWith(message);
    });
  });

  describe('info', () => {
    it('should log a message', () => {
      // Given
      const message = 'test';
      jest.spyOn(console, 'info').mockImplementation();

      // When
      sut.info(message);

      // Then
      expect(console.info).toHaveBeenCalledWith(message);
    });
  });

  describe('debug', () => {
    it('should log a message', () => {
      // Given
      const message = 'test';
      jest.spyOn(console, 'debug').mockImplementation();

      // When
      sut.debug(message);

      // Then
      expect(console.debug).toHaveBeenCalledWith(message);
    });
  });

  describe('trace', () => {
    it('should log a message', () => {
      // Given
      const message = 'test';
      jest.spyOn(console, 'trace').mockImplementation();

      // When
      sut.trace(message);

      // Then
      expect(console.trace).toHaveBeenCalledWith(message);
    });
  });
});
