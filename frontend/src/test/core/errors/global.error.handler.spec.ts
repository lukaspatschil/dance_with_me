import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from '../../../app/core/errors/global.error.handler';
import { LoggerService } from "../../../app/core/logger/logger.service";
import { LoggerMockService } from '../../mock/logger.service.mock';

describe('LoggerService', () => {
  let sut: GlobalErrorHandler;
  let loggerService: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, { provide: LoggerService, useClass: LoggerMockService }]
    });

    sut = TestBed.inject(GlobalErrorHandler);
    loggerService = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('handleError', () => {
    it('should handle an incoming error', () => {
      // Given
      const error = new Error('test');
      // When
      sut.handleError(error);

      // Then
      expect(loggerService.error).toHaveBeenCalledWith(error);
    });
  });
});
