import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComponent } from '../../../app/components/admin/admin.component';
import { AdminServiceMock } from '../../mock/admin.service.mock';
import { AdminService } from '../../../app/services/admin.service';
import { ValidationEnum } from '../../../app/enums/validation.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageService } from '../../../app/services/image.service';
import { ImageServiceMock } from '../../mock/image.service.mock';

describe('OverviewComponent', () => {
  let sut: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let adminService: AdminService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminComponent ],
      providers: [{ provide: AdminService, useClass: AdminServiceMock }, DomSanitizer, { provide: ImageService, useClass: ImageServiceMock }]
    })
      .compileComponents();

    adminService = TestBed.inject(AdminService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should get the requests', () => {
      // Given
      jest.spyOn(sut, 'setRequests');

      // When
      sut.ngOnInit();

      // Then
      expect(sut.setRequests).toHaveBeenCalled();
    });
  });

  describe('setRequests', () => {
    it('should get the requests', () => {
      // When
      sut.setRequests();

      // Then
      expect(adminService.getAllRequests).toHaveBeenCalled();
    });
  });

  describe('accept', () => {
    it('should update the request', () => {
      // When
      sut.accept('id');

      // Then
      expect(adminService.updateRequest).toHaveBeenCalledWith('id', ValidationEnum.APPROVED, '');
    });
  });

  describe('reject', () => {
    it('should update the request', () => {
      // When
      sut.reject('id');

      // Then
      expect(adminService.updateRequest).toHaveBeenCalledWith('id', ValidationEnum.REJECTED, '');
    });
  });
});
