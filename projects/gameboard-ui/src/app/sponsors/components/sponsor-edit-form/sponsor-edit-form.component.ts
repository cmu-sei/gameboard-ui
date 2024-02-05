import { Sponsor, UpsertSponsor } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sponsor-edit-form',
  templateUrl: './sponsor-edit-form.component.html',
  styleUrls: ['./sponsor-edit-form.component.scss']
})
export class SponsorEditFormComponent implements OnInit, OnChanges {
  @Input() existingSponsor?: Sponsor;
  @Output() sponsorSaved = new EventEmitter<Sponsor>();

  protected allowMimeTypes = this.sponsorService.allowedMimeTypes;
  protected previewSrc: null | string = null;
  protected upsertSponsorRequest: UpsertSponsor = { name: "" };
  protected eligibleParentSponsors: Sponsor[] = [];

  constructor(private sponsorService: SponsorService) { }

  async ngOnInit(): Promise<void> {
    await this.loadEligibleParentSponsors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initSponsor(this.existingSponsor);
  }

  protected handleDrop(files: File[]) {
    if (!files?.length)
      throw new Error("Drop an image to add it to this sponsor.");

    this.previewDrop(files[0]);
    this.upsertSponsorRequest.logoFile = files[0];
  }

  protected async handleSave(sponsor: UpsertSponsor) {
    let upsertedSponsor: Sponsor | null = null;

    if (!sponsor.id) {
      upsertedSponsor = await firstValueFrom(this.sponsorService.create(sponsor));
    }
    else {
      upsertedSponsor = await firstValueFrom(this.sponsorService.update({ id: sponsor.id, ...sponsor }));
    }

    if (!upsertedSponsor) {
      throw new Error(`Error upserting data for sponsor ${sponsor.name}`);
    }

    // separately call to upload the image (because it needs a different content type for the request)
    if (sponsor.logoFile) {
      await firstValueFrom(this.sponsorService.setAvatar(upsertedSponsor.id, sponsor.logoFile));
    }

    this.sponsorSaved.emit(upsertedSponsor);
    this.initSponsor(this.existingSponsor);
  }

  private async loadEligibleParentSponsors() {
    this.eligibleParentSponsors = await firstValueFrom(this.sponsorService.list({ excludeSponsorId: this.existingSponsor?.id, hasParent: false }));
  }

  private initSponsor(existingSponsor?: Sponsor) {
    this.upsertSponsorRequest = {
      id: existingSponsor?.id,
      name: existingSponsor?.name || "",
      parentSponsorId: existingSponsor?.parentSponsorId || undefined
    };

    if (this.existingSponsor?.logo) {
      this.previewSrc = this.sponsorService.resolveAbsoluteSponsorLogoUri(this.existingSponsor.logo);
    }
  }

  private previewDrop(file: File) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      this.previewSrc = reader.result?.toString() || null;
    });

    reader.readAsDataURL(file);
  }
}
