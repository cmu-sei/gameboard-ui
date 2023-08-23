import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CertificatesService } from '@/api/certificates.service';
import { UserService as LocalUser } from "@/utility/user.service";
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { PracticeModeCertificate, PublishedCertificateViewModel } from '@/users/users.models';
import { ConfigService } from '@/utility/config.service';

@Component({
  selector: 'app-certificate-publish-controls',
  templateUrl: './certificate-publish-controls.component.html',
  styleUrls: ['./certificate-publish-controls.component.scss']
})
export class CertificatePublishControlsComponent implements OnInit {
  @Input() certificate?: PublishedCertificateViewModel;
  @Output() publishStatusChange = new EventEmitter<PublishedCertificateViewModel>();

  protected appBaseUrl: string | null = null;
  protected localUserId: string | null = null;

  constructor(
    private certificatesService: CertificatesService,
    private configService: ConfigService,
    private localUser: LocalUser,
    private modalService: ModalConfirmService) { }

  ngOnInit(): void {
    this.appBaseUrl = this.configService.absoluteUrl;
    this.localUserId = this.localUser.user$.value?.id || null;
  }

  handlePublishClick(certificate: PublishedCertificateViewModel) {
    this.modalService.openConfirm({
      title: `Publish "${certificate.awardedForEntity.name}" certificate?`,
      bodyContent: `If you publish this certificate, it'll become public. This means that anyone who has the link can view it, even if they don't have a Gameboard account. Are you sure?`,
      onConfirm: async () => {
        if (!this.localUserId)
          throw new Error("Can't publish a certificate while not logged in.");

        if (!this.certificate) {
          throw new Error("No certificate specified for unpublish.");
        }

        const publishedCertificate = await this.certificatesService.publishCertificate(this.certificate.mode, this.localUserId, certificate.awardedForEntity.id);
        this.publishStatusChange.emit(publishedCertificate);
      },
      cancelButtonText: "Nevermind; keep it private",
      confirmButtonText: "Publish"
    });
  }

  handleUnpublishClick(certificate: PublishedCertificateViewModel) {
    this.modalService.openConfirm({
      title: `Unpublish "${certificate.awardedForEntity.name}" certificate?`,
      bodyContent: `If you unpublish this certificate, it'll become private. This means that the certificate will no longer be viewable on Gameboard by anyone except you. Note that if anyone accessed the certificate while it was public and saved it, they may still have a copy. Are you sure?`,
      onConfirm: async () => {
        if (!this.localUserId) {
          throw new Error("Can't unpublish a certificate while not logged in.");
        }

        if (!this.certificate) {
          throw new Error("No certificate specified for unpublish.");
        }

        const unpublishedCertificate = await this.certificatesService.unpublishCertificate(this.certificate.mode, this.localUserId, certificate.awardedForEntity.id);
        this.publishStatusChange.emit(unpublishedCertificate);
      },
      cancelButtonText: "Nevermind; keep it public",
      confirmButtonText: "Unpublish"
    });
  }
}
