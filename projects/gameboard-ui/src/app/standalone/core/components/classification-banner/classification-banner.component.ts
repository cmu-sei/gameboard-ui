// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input } from '@angular/core';
import { ComnHeaderBarComponent, ComnHeaderBarSettings } from '@cmusei/crucible-common/header-bar';

// The CSS custom property the banner keeps set to its own height while it's shown, so views sized
// to the screen (see --app-viewport-height in styles.scss) can leave room for it.
export const CLASSIFICATION_BANNER_HEIGHT_PROPERTY = '--classification-banner-height';

/**
 * Whether crucible-common's banner shows for these settings: enabled, with some text, and not inside
 * an iframe (the parent page shows its own). The app uses it to lay the page out around the banner.
 */
export function isClassificationBannerShown(settings: Partial<ComnHeaderBarSettings> | null | undefined, isFramed: boolean): boolean {
  if (!settings?.enabled || isFramed) {
    return false;
  }

  return hasText(settings.classification_text) || hasText(settings.message_text);
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && !!value.trim();
}

/**
 * crucible-common's classification banner (comn-header-bar), fed from Gameboard's settings. The library
 * renders it, with the same defaults as the other Crucible apps; this publishes its height for the
 * views that size themselves to the screen.
 */
@Component({
  selector: 'app-classification-banner',
  template: '<comn-header-bar [settings]="headerBarSettings()"></comn-header-bar>',
  styleUrl: './classification-banner.component.scss',
  imports: [ComnHeaderBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'region',
    'aria-label': 'Classification',
  }
})
export class ClassificationBannerComponent {
  public settings = input.required<Partial<ComnHeaderBarSettings>>();

  // The library reads each key with a default, so a partial block is fine.
  protected readonly headerBarSettings = computed(() => this.settings() as ComnHeaderBarSettings);

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
