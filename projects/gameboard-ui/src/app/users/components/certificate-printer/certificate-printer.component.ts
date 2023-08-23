import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '@/services/window.service';
import { CertificatesService } from '@/api/certificates.service';
import { PlayerMode } from '@/api/player-models';

@Component({
  selector: 'app-certificate-printer',
  templateUrl: './certificate-printer.component.html',
  styleUrls: ['./certificate-printer.component.scss']
})
export class CertificatePrinterComponent implements OnInit {
  protected title = "Gameboard Certificate";
  protected imageUrl?: SafeUrl;
  protected isAutoprint = false;
  protected isDownloading = true;
  protected isPublished = true;

  constructor(
    private certificatesService: CertificatesService,
    private route: ActivatedRoute,
    private windowService: WindowService) { }

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
    }
    catch (err) {
      this.isDownloading = false;
      this.isPublished = false;
    }
  }

  protected handleError() {
    this.isDownloading = false;
    throw new Error("Error loading the certificate image.");
  }

  protected handleLoad() {
    this.isDownloading = false;

    if (this.isAutoprint)
      this.windowService.print();
  }
}
