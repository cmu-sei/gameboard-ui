// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComnHeaderBarComponent, ComnHeaderBarSettings } from '@cmusei/crucible-common/header-bar';
import { AppComponent } from './app.component';
import { ThemeService } from './core/services/theme.service';
import { WindowService } from './services/window.service';
import { ClassificationBannerComponent } from './standalone/core/components/classification-banner/classification-banner.component';
import { ClassificationBannerService } from './standalone/core/components/classification-banner/classification-banner.service';
import { AuthService } from './utility/auth.service';
import { ConfigService } from './utility/config.service';

describe('AppComponent', () => {
  async function render(headerBarSettings?: Partial<ComnHeaderBarSettings>, isFramed = false) {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [ClassificationBannerComponent],
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => Promise.resolve(true), login: () => Promise.resolve() } },
        { provide: ConfigService, useValue: { environment: { settings: { oidc: {}, HeaderBarSettings: headerBarSettings } } } },
        { provide: ThemeService, useValue: { getThemeBgClass: () => '' } },
        { provide: WindowService, useValue: { isFramed: () => isFramed } },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    // Karma runs specs in an iframe, where the library hides its banner; isFramed above is what's tested.
    const view = { self: {}, top: {} };
    view.top = view.self;
    TestBed.overrideComponent(ComnHeaderBarComponent, {
      add: { providers: [{ provide: DOCUMENT, useValue: { defaultView: view } }] }
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the classification banner above the app when configured', async () => {
    const fixture = await render({ enabled: true, classification_text: 'UNCLASSIFIED' });
    const app = fixture.nativeElement as HTMLElement;

    expect(app.firstElementChild?.tagName).toBe('APP-CLASSIFICATION-BANNER');
    expect(app.querySelector('app-classification-banner')?.textContent).toContain('UNCLASSIFIED');
    fixture.destroy();
  });

  it('keeps the window as the scroller, with the banner stuck to its top', async () => {
    const fixture = await render({ enabled: true, classification_text: 'UNCLASSIFIED' });
    const app = fixture.nativeElement as HTMLElement;
    const banner = getComputedStyle(app.querySelector('app-classification-banner')!);
    const container = getComputedStyle(app.querySelector('.app-container')!);

    expect(banner.position).toBe('sticky');
    expect(banner.top).toBe('0px');
    expect(container.overflowY).toBe('visible');
    fixture.destroy();
  });

  it('prints the classification banner unless a page turns it off', async () => {
    const fixture = await render({ enabled: true, classification_text: 'UNCLASSIFIED' });
    const banner = () => (fixture.nativeElement as HTMLElement).querySelector('app-classification-banner')!;
    expect(banner().classList.contains('print-hide')).toBeFalse();

    TestBed.inject(ClassificationBannerService).setHiddenInPrint(true);
    fixture.detectChanges();
    expect(banner().classList.contains('print-hide')).toBeTrue();

    TestBed.inject(ClassificationBannerService).setHiddenInPrint(false);
    fixture.detectChanges();
    expect(banner().classList.contains('print-hide')).toBeFalse();
    fixture.destroy();
  });

  it('shows no classification banner without the setting', async () => {
    const fixture = await render();
    const app = fixture.nativeElement as HTMLElement;

    expect(app.querySelector('app-classification-banner')).toBeNull();
    fixture.destroy();
  });

  it('shows no classification banner inside an iframe', async () => {
    const fixture = await render({ enabled: true, classification_text: 'UNCLASSIFIED' }, true);
    const app = fixture.nativeElement as HTMLElement;

    expect(app.querySelector('app-classification-banner')).toBeNull();
    fixture.destroy();
  });

  it('shows no classification banner when it is disabled', async () => {
    const fixture = await render({ enabled: false, classification_text: 'UNCLASSIFIED' });
    const app = fixture.nativeElement as HTMLElement;

    expect(app.querySelector('app-classification-banner')).toBeNull();
    fixture.destroy();
  });
});
