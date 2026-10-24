// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HeaderBarSettings } from '../environments/environment-typed';
import { AppComponent } from './app.component';
import { ThemeService } from './core/services/theme.service';
import { WindowService } from './services/window.service';
import { ClassificationBannerComponent } from './standalone/core/components/classification-banner/classification-banner.component';
import { AuthService } from './utility/auth.service';
import { ConfigService } from './utility/config.service';

describe('AppComponent', () => {
  async function render(headerBarSettings?: Partial<HeaderBarSettings>, isFramed = false) {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [ClassificationBannerComponent],
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => Promise.resolve(true), login: () => Promise.resolve() } },
        { provide: ConfigService, useValue: { environment: { settings: { oidc: {}, HeaderBarSettings: headerBarSettings } } } },
        { provide: ThemeService, useValue: { getThemeBgClass: () => '' } },
        { provide: WindowService, useValue: { isFramed: () => isFramed } },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the classification banner above the app when configured', async () => {
    const fixture = await render({ enabled: true, classification_text: 'UNCLASSIFIED' });
    const app = fixture.nativeElement as HTMLElement;

    expect(app.classList.contains('has-classification-banner')).toBeTrue();
    expect(app.firstElementChild?.tagName).toBe('APP-CLASSIFICATION-BANNER');
    expect(app.querySelector('app-classification-banner')?.textContent).toContain('UNCLASSIFIED');
    fixture.destroy();
  });

  it('shows no classification banner without the setting', async () => {
    const fixture = await render();
    const app = fixture.nativeElement as HTMLElement;

    expect(app.classList.contains('has-classification-banner')).toBeFalse();
    expect(app.querySelector('app-classification-banner')).toBeNull();
    fixture.destroy();
  });

  it('shows no classification banner inside an iframe', async () => {
    const fixture = await render({ enabled: true, classification_text: 'UNCLASSIFIED' }, true);
    const app = fixture.nativeElement as HTMLElement;

    expect(app.classList.contains('has-classification-banner')).toBeFalse();
    expect(app.querySelector('app-classification-banner')).toBeNull();
    fixture.destroy();
  });

  it('shows no classification banner when it is disabled', async () => {
    const fixture = await render({ enabled: false, classification_text: 'UNCLASSIFIED' });
    const app = fixture.nativeElement as HTMLElement;

    expect(app.classList.contains('has-classification-banner')).toBeFalse();
    expect(app.querySelector('app-classification-banner')).toBeNull();
    fixture.destroy();
  });
});
