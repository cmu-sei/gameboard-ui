// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NEVER } from 'rxjs';
import { CertificatesService } from '@/api/certificates.service';
import { AppTitleService } from '@/services/app-title.service';
import { LogService } from '@/services/log.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { RouterService } from '@/services/router.service';
import { WindowService } from '@/services/window.service';
import { ClassificationBannerService } from '@/standalone/core/components/classification-banner/classification-banner.service';
import { ConfigService } from '@/utility/config.service';
import { CertificatePrinterComponent } from './certificate-printer.component';

describe('CertificatePrinterComponent', () => {
  function render() {
    TestBed.configureTestingModule({
      declarations: [CertificatePrinterComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: NEVER,
            snapshot: {
              paramMap: convertToParamMap({ userId: 'user', awardedForEntityId: 'game', playerMode: 'competition' }),
              queryParamMap: convertToParamMap({})
            }
          }
        },
        { provide: AppTitleService, useValue: { set: () => { } } },
        { provide: CertificatesService, useValue: {} },
        { provide: ConfigService, useValue: { appName: 'Gameboard' } },
        { provide: LogService, useValue: { logError: () => { }, logInfo: () => { } } },
        { provide: ModalConfirmService, useValue: {} },
        { provide: RouterService, useValue: {} },
        { provide: WindowService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    return TestBed.createComponent(CertificatePrinterComponent);
  }

  it('prints without the classification banner while it is shown', () => {
    const fixture = render();
    const banner = TestBed.inject(ClassificationBannerService);
    expect(banner.isHiddenInPrint()).toBeTrue();

    fixture.destroy();
    expect(banner.isHiddenInPrint()).toBeFalse();
  });
});
