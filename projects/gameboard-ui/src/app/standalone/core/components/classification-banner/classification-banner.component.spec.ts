// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { HeaderBarSettings } from '../../../../../environments/environment-typed';
import {
  CLASSIFICATION_BANNER_HEIGHT_PROPERTY,
  ClassificationBanner,
  ClassificationBannerComponent,
  resolveClassificationBanner
} from './classification-banner.component';

describe('resolveClassificationBanner', () => {
  const settings: HeaderBarSettings = {
    enabled: true,
    banner_background_color: '#007a33ff',
    classification_text: 'UNCLASSIFIED // FOR TRAINING USE ONLY',
    classification_text_color: '#ffffff',
    classification_text_fontsize: '14',
    message_text: 'LOCAL DEVELOPMENT',
    message_text_color: '#ffff00',
    message_text_fontsize: '14',
  };

  it('uses the configured text, colors, and font sizes', () => {
    expect(resolveClassificationBanner(settings, false)).toEqual({
      backgroundColor: '#007a33ff',
      classificationText: 'UNCLASSIFIED // FOR TRAINING USE ONLY',
      classificationTextColor: '#ffffff',
      classificationTextFontSize: '14',
      messageText: 'LOCAL DEVELOPMENT',
      messageTextColor: '#ffff00',
      messageTextFontSize: '14',
    });
  });

  it('shows nothing without settings', () => {
    expect(resolveClassificationBanner(undefined, false)).toBeNull();
    expect(resolveClassificationBanner(null, false)).toBeNull();
  });

  it('shows nothing when disabled', () => {
    expect(resolveClassificationBanner({ ...settings, enabled: false }, false)).toBeNull();
    expect(resolveClassificationBanner({ classification_text: 'UNCLASSIFIED' }, false)).toBeNull();
  });

  it('shows nothing without any text', () => {
    expect(resolveClassificationBanner({ ...settings, classification_text: ' ', message_text: '' }, false)).toBeNull();
  });

  it('shows nothing inside an iframe', () => {
    expect(resolveClassificationBanner(settings, true)).toBeNull();
  });

  it('falls back to the Crucible.Common.Ui defaults for blank values', () => {
    expect(resolveClassificationBanner({ enabled: true, message_text: 'EXERCISE', banner_background_color: ' ' }, false)).toEqual({
      backgroundColor: '#d40000ff',
      classificationText: '',
      classificationTextColor: '#ffffff',
      classificationTextFontSize: '22',
      messageText: 'EXERCISE',
      messageTextColor: '#ffffff',
      messageTextFontSize: '18',
    });
  });
});

describe('ClassificationBannerComponent', () => {
  const banner: ClassificationBanner = {
    backgroundColor: 'rgb(0, 122, 51)',
    classificationText: 'UNCLASSIFIED // FOR TRAINING USE ONLY',
    classificationTextColor: 'rgb(255, 255, 255)',
    classificationTextFontSize: '14',
    messageText: 'LOCAL DEVELOPMENT',
    messageTextColor: 'rgb(255, 255, 0)',
    messageTextFontSize: '16',
  };

  async function render() {
    await TestBed.configureTestingModule({
      imports: [ClassificationBannerComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(ClassificationBannerComponent);
    fixture.componentRef.setInput('banner', banner);
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

  it('renders the classification and message with their colors and sizes', async () => {
    const fixture = await render();
    const element = fixture.nativeElement as HTMLElement;
    const section = element.querySelector('section')!;
    const classification = element.querySelector<HTMLElement>('.classification-text')!;
    const message = element.querySelector<HTMLElement>('.message-text')!;

    expect(section.getAttribute('aria-label')).toBe('Classification');
    expect(section.style.backgroundColor).toBe('rgb(0, 122, 51)');
    expect(classification.textContent).toBe('UNCLASSIFIED // FOR TRAINING USE ONLY');
    expect(classification.style.color).toBe('rgb(255, 255, 255)');
    expect(classification.style.fontSize).toBe('14px');
    expect(message.textContent).toBe('LOCAL DEVELOPMENT');
    expect(message.style.color).toBe('rgb(255, 255, 0)');
    expect(message.style.fontSize).toBe('16px');
    fixture.destroy();
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

    fixture.componentRef.setInput('banner', { ...banner, messageTextFontSize: '40' });
    fixture.detectChanges();
    await afterResizeObservations();

    const height = (fixture.nativeElement as HTMLElement).getBoundingClientRect().height;
    expect(height).toBeGreaterThan(before);
    expect(bannerHeightProperty()).toBe(`${height}px`);
    fixture.destroy();
  });
});
