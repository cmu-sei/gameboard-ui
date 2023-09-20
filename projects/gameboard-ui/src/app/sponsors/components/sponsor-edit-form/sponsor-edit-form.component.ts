import { NewSponsor, Sponsor } from '@/api/sponsor-models';
import { SponsorService } from '@/api/sponsor.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sponsor-edit-form',
  templateUrl: './sponsor-edit-form.component.html',
  styleUrls: ['./sponsor-edit-form.component.scss']
})
export class SponsorEditFormComponent {
  @Output() sponsorSaved = new EventEmitter<Sponsor>();

  protected previewSrc: null | string = null;
  protected newSponsorRequest: NewSponsor = { name: "" };

  constructor(private sponsorService: SponsorService) {
    this.initNewSponsor();
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
