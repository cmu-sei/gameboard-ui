import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { WindowService } from '@/services/window.service';
import { CertificatesService } from '@/api/certificates.service';
import { PlayerMode } from '@/api/player-models';
import { LogService } from '@/services/log.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { RouterService } from '@/services/router.service';
import { ConfigService } from '@/utility/config.service';
import { AppTitleService } from '@/services/app-title.service';

@Component({
    selector: 'app-certificate-printer',
    templateUrl: './certificate-printer.component.html',
    styleUrls: ['./certificate-printer.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class CertificatePrinterComponent {
  @ViewChild("provideNameModal") provideNameModalTemplate?: TemplateRef<any>;

  protected appName = this.configService.appName;
  protected isDownloading = false;
  protected isPublished = true;
  protected imageUrl?: SafeUrl;
  protected requestNameOverrideForm = new FormGroup({
    requestedNameOverride: new FormControl("")
  });
  protected title = "";

  protected viewModel = {
    awardedForEntityId: this.route.snapshot.paramMap.get("awardedForEntityId") || "",
    isAutoPrint: (this.route.snapshot.queryParamMap.get("autoprint") || "") == "true",
    mode: (this.route.snapshot.paramMap.get("playerMode") || "practice") == "practice" ? PlayerMode.practice : PlayerMode.competition,
    userId: this.route.snapshot.paramMap.get("userId") || ""
  };

  constructor(
    protected windowService: WindowService,
    private certificatesService: CertificatesService,
    private configService: ConfigService,
    private logService: LogService,
    private modalService: ModalConfirmService,
    private route: ActivatedRoute,
    private routerService: RouterService,
    private titleService: AppTitleService,
    private unsub: UnsubscriberService) {
    this.titleService.set("Certificate");
    this.unsub.add(this.route.queryParams.subscribe(async params => {
      await this.downloadCertificate(params.requestedNameOverride);
    }));
  }

  protected handleError(err: any) {
    this.logService.logError("Error loading the certificate image.", err);
  }

  protected handleLoad() {
    this.isDownloading = false;

    if (this.viewModel.isAutoPrint) {
      // Unfortunately, we have to punt a little here and 
      // give it an extra half second or so to render the loaded image (so that it doesn't
      // to print a picture of the loading animation instead)
      setTimeout(() => this.windowService.print(), 500);
    }
  }

  protected handlePrintClick() {
    setTimeout(() => this.windowService.print(), 500);
  }

  protected handleProvideNameClick() {
    if (!this.provideNameModalTemplate)
      throw new Error("Couldn't load the template.");

    this.modalService.openTemplate(this.provideNameModalTemplate);
  }

  protected async handleNameProvided() {
    if (!this.viewModel) {
      throw new Error("Viewmodel not loaded.");
    }

    if (!this.requestNameOverrideForm.valid) {
      throw new Error("validation error");
    }

    this.modalService.hide();
    await this.routerService.updateQueryParams({ parameters: { requestedNameOverride: this.requestNameOverrideForm.value.requestedNameOverride } });
  }

  private async downloadCertificate(providedName?: string) {
    this.isDownloading = true;
    this.imageUrl = undefined;
    this.title = `${this.viewModel.mode} Certificate | ${this.configService.appName}`;
    this.titleService.set(this.title);

    if (!this.viewModel.userId || !this.viewModel.awardedForEntityId) {
      throw new Error(`Couldn't resolve user and entity for certificate (user ${this.viewModel.userId}, entity ${this.viewModel.awardedForEntityId}).`);
    }

    // need to refined detection of other validation errors vs. unpublished, but this is what we have for now
    try {
      this.imageUrl = await firstValueFrom(this.certificatesService.getCertificateImage(this.viewModel.mode, this.viewModel.userId, this.viewModel.awardedForEntityId, providedName));
    }
    catch (err) {
      this.isPublished = false;
    }
    this.isDownloading = false;
  }
}
