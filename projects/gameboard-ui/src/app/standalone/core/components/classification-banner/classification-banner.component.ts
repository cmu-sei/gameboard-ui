// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input } from '@angular/core';
import { HeaderBarSettings } from '../../../../../environments/environment-typed';

export interface ClassificationBanner {
  backgroundColor: string;
  classificationText: string;
  classificationTextColor: string;
  classificationTextFontSize: string;
  messageText: string;
  messageTextColor: string;
  messageTextFontSize: string;
}

// The CSS custom property the banner keeps set to its own height while it's shown, so views sized
// to the screen (see --app-viewport-height in styles.scss) can leave room for it.
export const CLASSIFICATION_BANNER_HEIGHT_PROPERTY = '--classification-banner-height';

/**
 * Resolves HeaderBarSettings the same way the comn-header-bar component in Crucible.Common.Ui does,
 * so a site configured once shows the same banner in Gameboard as in the other Crucible apps:
 * nothing unless the banner is enabled and has text, nothing inside an iframe (the parent page
 * shows its own), and the library's colors and font sizes for any value left blank.
 */
export function resolveClassificationBanner(settings: Partial<HeaderBarSettings> | null | undefined, isFramed: boolean): ClassificationBanner | null {
  if (!settings?.enabled || isFramed) {
    return null;
  }

  const banner: ClassificationBanner = {
    backgroundColor: valueOrDefault(settings.banner_background_color, '#d40000ff'),
    classificationText: valueOrDefault(settings.classification_text, ''),
    classificationTextColor: valueOrDefault(settings.classification_text_color, '#ffffff'),
    classificationTextFontSize: valueOrDefault(settings.classification_text_fontsize, '22'),
    messageText: valueOrDefault(settings.message_text, ''),
    messageTextColor: valueOrDefault(settings.message_text_color, '#ffffff'),
    messageTextFontSize: valueOrDefault(settings.message_text_fontsize, '18'),
  };

  return banner.classificationText || banner.messageText ? banner : null;
}

function valueOrDefault(value: unknown, defaultValue: string): string {
  return typeof value === 'string' && value.trim() ? value : defaultValue;
}

@Component({
  selector: 'app-classification-banner',
  templateUrl: './classification-banner.component.html',
  styleUrl: './classification-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassificationBannerComponent {
  public banner = input.required<ClassificationBanner>();

  constructor() {
    const document = inject(DOCUMENT);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // The banner's height follows its text, font sizes, and wrapping, so publish what it actually is.
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(CLASSIFICATION_BANNER_HEIGHT_PROPERTY, `${host.getBoundingClientRect().height}px`);
    });
    observer.observe(host);

    inject(DestroyRef).onDestroy(() => {
      observer.disconnect();
      document.documentElement.style.removeProperty(CLASSIFICATION_BANNER_HEIGHT_PROPERTY);
    });
  }
}
