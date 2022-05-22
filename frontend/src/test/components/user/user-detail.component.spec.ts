import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailComponent } from '../../../app/components/user/user-detail/user-detail.component';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { UserServiceMock } from "../../mock/user.service.mock";
import {UserService} from "../../../app/services/user.service";
import {TranslateModule} from "@ngx-translate/core";
import {UserEntity} from "../../../app/entities/user.entity";
import {Role} from "../../../app/enums/role";
import {RoleEnum} from "../../../app/enums/role.enum";
import {expandEnvs} from "env-cmd/dist/expand-envs";

describe('UserDetailComponent', () => {
  let comp: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  let httpMock: HttpTestingController;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDetailComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [{provide: UserService, useClass: UserServiceMock}]
    })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    userService = TestBed.inject(UserService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch user from API ', async () => {
      // When
      jest.spyOn(userService.user$, 'subscribe')

      await fixture.whenStable();
      comp.ngOnInit();

      // Then
      expect(userService.user$.subscribe).toHaveBeenCalled()
    })

  });

  describe('deleteUser', () => {
    it('should delete user from API ', async () => {
      // When
      jest.spyOn(userService, 'deleteUser')

      await fixture.whenStable();
      comp.deleteUser();

      // Then
      expect(userService.deleteUser).toHaveBeenCalled()
    });
  });

});
