import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleEntity } from '@/api/models';
import { ActivatedRoute, Router } from '@angular/router';
import { CertificatesService } from '@/api/certificates.service';
import { SafeUrl } from '@angular/platform-browser';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { WindowService } from '@/services/window.service';

@Component({
  selector: 'app-certificate-previewer',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent
  ],
  templateUrl: './certificate-previewer.component.html',
  styleUrls: ['./certificate-previewer.component.scss']
})
export class CertificatePreviewerComponent implements OnInit {
  protected errors: any[] = [];
  protected isDownloading = false;
  protected imageUrl?: SafeUrl;
  protected template?: SimpleEntity;

  private route = inject(ActivatedRoute);
  private certificatesService = inject(CertificatesService);

  async ngOnInit(): Promise<void> {
    const templateId = this.route.snapshot.queryParamMap.get("templateId");

    if (!templateId) {
      this.errors.push("Template ID is required.");
    }

    this.imageUrl = await this.certificatesService.getCertificatePreviewImage(templateId || "");
  }

  protected handleError(ev: ErrorEvent) {
    this.errors.push(ev);
  }

  protected handleImageLoad() {
    this.isDownloading = false;
  }
}
