import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PracticeService } from '@/services/practice.service';
import { SafeUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '@/services/window.service';

@Component({
  selector: 'app-certificate-printer',
  templateUrl: './certificate-printer.component.html',
  styleUrls: ['./certificate-printer.component.scss']
})
export class CertificatePrinterComponent implements OnInit {
  protected title = "Gameboard Certificate";
  protected imageUrl?: SafeUrl;
  protected isDownloading = true;

  constructor(
    private practiceService: PracticeService,
    private route: ActivatedRoute,
    private windowService: WindowService) { }

  async ngOnInit(): Promise<void> {
    const userId = this.route.snapshot.paramMap.get("userId");
    const entityId = this.route.snapshot.paramMap.get("challengeSpecId");

    if (!userId || !entityId) {
      throw new Error(`Couldn't resolve user and entity for certificate (user ${userId}, entity ${entityId}).`);
    }

    this.imageUrl = await firstValueFrom(this.practiceService.getCertificateImage(userId, entityId));
  }

  protected handleError() {
    this.isDownloading = false;
    throw new Error("Error loading the certificate image.");
  }

  protected handleLoad() {
    this.isDownloading = false;
    this.windowService.print();
  }
}
