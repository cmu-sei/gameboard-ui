import { NewSponsor, Sponsor } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sponsor-edit-form',
  templateUrl: './sponsor-edit-form.component.html',
  styleUrls: ['./sponsor-edit-form.component.scss']
})
export class SponsorEditFormComponent implements OnInit {
  @Output() sponsorSaved = new EventEmitter<Sponsor>();

  protected allowMimeTypes = this.sponsorService.allowedMimeTypes;
  protected previewSrc: null | string = null;
  protected newSponsorRequest: NewSponsor = { name: "" };
  protected eligibleParentSponsors: Sponsor[] = [];

  constructor(private sponsorService: SponsorService) {
    this.initNewSponsor();
  }

  async ngOnInit(): Promise<void> {
    await this.loadEligibleParentSponsors();
  }

  protected handleDrop(files: File[]) {
    if (!files?.length)
      throw new Error("Drop an image to add it to this sponsor.");

    this.previewDrop(files[0]);
    this.newSponsorRequest.logoFile = files[0];
  }

  protected async handleSave(sponsor: NewSponsor) {
    const savedSponsor = await firstValueFrom(this.sponsorService.create(sponsor));
    this.sponsorSaved.emit(savedSponsor);
    this.initNewSponsor();
  }

  private async loadEligibleParentSponsors() {
    this.eligibleParentSponsors = await firstValueFrom(this.sponsorService.list({ hasParent: false }));
  }

  private initNewSponsor() {
    this.newSponsorRequest = { name: "" };
    this.previewSrc = null;
  }

  private previewDrop(file: File) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      this.previewSrc = reader.result?.toString() || null;
    });

    reader.readAsDataURL(file);
  }
}
