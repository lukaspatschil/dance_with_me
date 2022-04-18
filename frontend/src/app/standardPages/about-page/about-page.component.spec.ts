import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPageComponent } from './about-page.component';
import {MockBuilder, MockRender} from "ng-mocks";
import {TranslateModule} from "@ngx-translate/core";

describe('AboutPageComponent', () => {
  let component: AboutPageComponent;
  let fixture: ComponentFixture<AboutPageComponent>;

  beforeEach(async () => {
    return MockBuilder(AboutPageComponent)
      .mock(TranslateModule.forRoot());
  });

  beforeEach(() => {
    fixture = MockRender(AboutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
