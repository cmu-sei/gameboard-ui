import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleEntity } from '@/api/models';
import { ActivatedRoute, Router } from '@angular/router';
import { CertificatesService } from '@/api/certificates.service';
import { SafeUrl } from '@angular/platform-browser';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';

@Component({
    selector: 'app-certificate-previewer',
    imports: [
        CommonModule,
        SpinnerComponent
    ],
    templateUrl: './certificate-previewer.component.html',
    styleUrls: ['./certificate-previewer.component.scss']
})
export class CertificatePreviewerComponent implements OnInit {
  protected errors: any[] = [];
  protected isDownloading = true;
  protected imageUrl?: SafeUrl;
  protected template?: SimpleEntity;

  private route = inject(ActivatedRoute);
  private certificatesService = inject(CertificatesService);

  async ngOnInit(): Promise<void> {
    const templateId = this.route.snapshot.queryParamMap.get("templateId");

    if (!templateId) {
      this.errors.push("Template ID is required.");
    }

    try {
      this.imageUrl = await this.certificatesService.getCertificatePreviewImage(templateId || "");
    }
    catch (err) {
      this.errors.push(err);
      this.isDownloading = false;
    }
  }

  protected handleError(ev: ErrorEvent) {
    this.errors.push(ev);
    this.isDownloading = false;
  }

  protected handleImageLoad() {
    this.isDownloading = false;
  }
}
