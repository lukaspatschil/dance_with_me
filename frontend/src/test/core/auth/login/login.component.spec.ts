import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from '../../../../app/core/auth/login/login.component';
import { GoogleComponent } from '../../../../app/core/auth/login/google/google.component';
import { FacebookComponent } from '../../../../app/core/auth/login/facebook/facebook.component';

describe('LoginComponent', () => {
  let sut: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent, GoogleComponent, FacebookComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
