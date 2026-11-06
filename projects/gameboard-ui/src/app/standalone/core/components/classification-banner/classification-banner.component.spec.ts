// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ComnHeaderBarComponent, ComnHeaderBarSettings } from '@cmusei/crucible-common/header-bar';
import {
  CLASSIFICATION_BANNER_HEIGHT_PROPERTY,
  ClassificationBannerComponent,
  isClassificationBannerShown
} from './classification-banner.component';

const settings: ComnHeaderBarSettings = {
  enabled: true,
  banner_background_color: '#007a33ff',
  classification_text: 'UNCLASSIFIED // FOR TRAINING USE ONLY',
  classification_text_color: '#ffffff',
  classification_text_fontsize: '14',
  message_text: 'LOCAL DEVELOPMENT',
  message_text_color: '#ffff00',
  message_text_fontsize: '16',
};

describe('isClassificationBannerShown', () => {
  it('shows an enabled banner with text', () => {
    expect(isClassificationBannerShown(settings, false)).toBeTrue();
  });

  it('shows a banner with only a message', () => {
    expect(isClassificationBannerShown({ enabled: true, message_text: 'EXERCISE' }, false)).toBeTrue();
  });

  it('hides a missing or disabled banner', () => {
    expect(isClassificationBannerShown(undefined, false)).toBeFalse();
    expect(isClassificationBannerShown(null, false)).toBeFalse();
    expect(isClassificationBannerShown({ ...settings, enabled: false }, false)).toBeFalse();
  });

  it('hides a banner with no text', () => {
    expect(isClassificationBannerShown({ enabled: true, classification_text: '  ', message_text: '' }, false)).toBeFalse();
  });

  it('hides the banner inside an iframe', () => {
    expect(isClassificationBannerShown(settings, true)).toBeFalse();
  });
});

describe('ClassificationBannerComponent', () => {
  // Karma runs specs in an iframe, where the library hides its banner, so its component gets a
  // document whose window isn't framed.
  async function render(value: Partial<ComnHeaderBarSettings> = settings) {
    const view = { self: {}, top: {} };
    view.top = view.self;
    TestBed.configureTestingModule({ imports: [ClassificationBannerComponent] });
    TestBed.overrideComponent(ComnHeaderBarComponent, {
      add: { providers: [{ provide: DOCUMENT, useValue: { defaultView: view } }] }
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(ClassificationBannerComponent);
    fixture.componentRef.setInput('settings', value);
    fixture.detectChanges();
    return fixture;
  }

  function bannerHeightProperty() {
    return document.documentElement.style.getPropertyValue(CLASSIFICATION_BANNER_HEIGHT_PROPERTY);
  }

  // Let web fonts settle, then wait out two frames: resize observations are delivered after a
  // frame's animation callbacks.
  async function afterResizeObservations() {
    await document.fonts.ready;
    for (let i = 0; i < 2; i++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }

  it('renders the library banner from HeaderBarSettings', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const bar = element.querySelector<HTMLElement>('comn-header-bar .message-bar')!;
    const [classification, message] = Array.from(bar.children) as HTMLElement[];

    expect(element.getAttribute('role')).toBe('region');
    expect(element.getAttribute('aria-label')).toBe('Classification');
    expect(bar.style.backgroundColor).toBe('rgb(0, 122, 51)');
    expect(classification.textContent).toBe('UNCLASSIFIED // FOR TRAINING USE ONLY');
    expect(classification.style.color).toBe('rgb(255, 255, 255)');
    expect(classification.style.fontSize).toBe('14px');
    expect(message.textContent).toBe('LOCAL DEVELOPMENT');
    expect(message.style.color).toBe('rgb(255, 255, 0)');
    expect(message.style.fontSize).toBe('16px');
    fixture.destroy();
  });

  it('uses normal line height whatever the page sets', async () => {
    document.body.style.lineHeight = '1.5';
    try {
      const fixture = await render();
      expect(getComputedStyle(fixture.nativeElement).lineHeight).toBe('normal');
      fixture.destroy();
    } finally {
      document.body.style.removeProperty('line-height');
    }
  });

  it('publishes its height while shown and clears it when removed', async () => {
    const fixture = await render();
    await afterResizeObservations();

    const height = (fixture.nativeElement as HTMLElement).getBoundingClientRect().height;
    expect(height).toBeGreaterThan(0);
    expect(bannerHeightProperty()).toBe(`${height}px`);

    fixture.destroy();
    expect(bannerHeightProperty()).toBe('');
  });

  it('updates the published height when the banner changes size', async () => {
    const fixture = await render();
    await afterResizeObservations();
    const before = parseFloat(bannerHeightProperty());

    fixture.componentRef.setInput('settings', { ...settings, message_text_fontsize: '40' });
    fixture.detectChanges();
    await afterResizeObservations();

    expect(parseFloat(bannerHeightProperty())).toBeGreaterThan(before);
    fixture.destroy();
  });
});
