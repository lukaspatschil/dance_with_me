import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPageComponent } from '../../../app/components/privacy-page/privacy-page.component';

describe('PrivacyPageComponent', () => {
  let fixture: ComponentFixture<PrivacyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivacyPageComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPageComponent);
    fixture.detectChanges();
  });

  it('should have as title \'privacy-page\'', () => {
    const app = fixture.componentInstance;
    expect(app.title).toEqual('privacy-page');
  });
});
