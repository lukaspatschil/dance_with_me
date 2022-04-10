import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPageComponent } from './privacy-page.component';
import {AppComponent} from "../../app.component";

describe('PrivacyPageComponent', () => {
  let component: PrivacyPageComponent;
  let fixture: ComponentFixture<PrivacyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrivacyPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should have as title 'privacy-page'`, () => {
    const fixture = TestBed.createComponent(PrivacyPageComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('privacy-page');
  });
});
