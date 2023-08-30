import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '@/services/window.service';
import { CertificatesService } from '@/api/certificates.service';
import { PlayerMode } from '@/api/player-models';
import { LogService } from '@/services/log.service';

@Component({
  selector: 'app-certificate-printer',
  templateUrl: './certificate-printer.component.html',
  styleUrls: ['./certificate-printer.component.scss']
})
export class CertificatePrinterComponent implements OnInit {
  protected title = "";
  protected imageUrl?: SafeUrl;
  protected isAutoprint = false;
  protected isDownloading = true;
  protected isPublished = true;

  constructor(
    protected windowService: WindowService,
    private certificatesService: CertificatesService,
    private logService: LogService,
    private route: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    const userId = this.route.snapshot.paramMap.get("userId");
    const awardedForEntityId = this.route.snapshot.paramMap.get("awardedForEntityId");
    const mode = (this.route.snapshot.paramMap.get("playerMode") || "practice") == "practice" ? PlayerMode.practice : PlayerMode.competition;
    this.isAutoprint = (this.route.snapshot.queryParamMap.get("autoprint") || "") == "true";

    if (!userId || !awardedForEntityId) {
      throw new Error(`Couldn't resolve user and entity for certificate (user ${userId}, entity ${awardedForEntityId}).`);
    }

    // need to refined detection of other validation errors vs. unpublished, but this is what we have for now
    try {
      this.imageUrl = await firstValueFrom(this.certificatesService.getCertificateImage(mode, userId, awardedForEntityId));
      this.title = `${mode} Certificate`;
    }
    catch (err) {
      this.isDownloading = false;
      this.isPublished = false;
    }
  }

  protected handleError(err: any) {
    this.logService.logError("Error loading the certificate image.", err);
  }

  protected handleLoad() {
    this.isDownloading = false;

    if (this.isAutoprint) {
      // Unfortunately, we have to punt a little here and 
      // give it an extra half second or so to render the loaded image (so that it doesn't
      // to print a picture of the loading animation instead)
      setTimeout(() => this.windowService.print(), 500);
    }
  }

  protected handlePrintClick() {
    setTimeout(() => {
      this.windowService.print();
    }, 500);
  }
}
