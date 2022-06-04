import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleComponent } from '../../../../../app/core/auth/login/google/google.component';

describe('GoogleComponent', () => {
  let sut: GoogleComponent;
  let fixture: ComponentFixture<GoogleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
