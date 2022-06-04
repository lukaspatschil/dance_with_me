import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalPageComponent } from '../../../app/components/legal-page/legal-page.component';

describe('LegalPageComponent', () => {
  let fixture: ComponentFixture<LegalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegalPageComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalPageComponent);
    fixture.detectChanges();
  });

  it('should have as title \'legal-page\'', () => {
    fixture = TestBed.createComponent(LegalPageComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('legal-page');
  });
});
