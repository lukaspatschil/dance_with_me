import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalPageComponent } from './legal-page.component';

describe('LegalPageComponent', () => {
  let component: LegalPageComponent;
  let fixture: ComponentFixture<LegalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegalPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should have as title 'legal-page'`, () => {
    const fixture = TestBed.createComponent(LegalPageComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('legal-page');
  });
});
