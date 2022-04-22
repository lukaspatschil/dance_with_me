import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacebookComponent } from '../../../../../app/core/auth/login/facebook/facebook.component';

describe('FacebookComponent', () => {
  let sut: FacebookComponent;
  let fixture: ComponentFixture<FacebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacebookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacebookComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
