import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from '../app/app.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AuthService } from '../app/core/auth/auth.service';

describe('AppComponent', () => {

  beforeEach(async () => {
    return MockBuilder(AppComponent)
      .mock(RouterTestingModule)
      .mock(AuthService)
      .mock(TranslateModule.forRoot());
  });

  it('should create the app', () => {
    const fixture = MockRender(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have as title \'dance-with-me-web-client\'', () => {
    const fixture = MockRender(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('dance-with-me-web-client');
  });

  describe('toggleNavbar', () => {
    it('should be closed', () => {
      // Given
      const fixture = MockRender(AppComponent);
      const comp = fixture.componentInstance;

      // Then
      expect(comp.navbarOpened).toBe(false);
    });

    it('should open when toggled', () => {
      // Given
      const fixture = MockRender(AppComponent);
      const comp = fixture.componentInstance;

      // When
      comp.toggleNavbar();

      // Then
      expect(comp.navbarOpened).toBe(true);
    });

    it('should close after being opened', () => {
      // Given
      const fixture = MockRender(AppComponent);
      const comp = fixture.componentInstance;

      // When
      // toggle open
      comp.toggleNavbar();
      // close it again
      comp.toggleNavbar();

      // Then
      expect(comp.navbarOpened).toBe(false);
    });
  });


  describe('toggleLanguage', () => {
    it('should be set to "de"', () => {
      // Given
      const fixture = MockRender(AppComponent);
      const comp = fixture.componentInstance;

      // THen
      expect(comp.language).toBe('de');
    });

    it('should set language to "en"', () => {
      // Given
      const fixture = MockRender(AppComponent);
      const comp = fixture.componentInstance;

      // When
      comp.toggleLanguage();

      // Then
      expect(comp.language).toBe('en');
    });


    it('should switch language to "de" after being set to "en"', () => {
      // Given
      const fixture = MockRender(AppComponent);
      const comp = fixture.componentInstance;

      // When
      // toggle language to 'en'
      comp.toggleLanguage();
      // toggle language to 'de'
      comp.toggleLanguage();

      // Then
      expect(comp.language).toBe('de');
    });
  });

});
