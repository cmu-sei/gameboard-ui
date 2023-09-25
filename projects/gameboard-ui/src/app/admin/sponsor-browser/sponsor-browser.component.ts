// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { firstValueFrom } from 'rxjs';
import { ChangedSponsor, Sponsor, SponsorWithChildSponsors, SponsorWithParent } from '../../api/sponsor-models';
import { SponsorService } from '../../api/sponsor.service';
import { ToastService } from '@/utility/services/toast.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { SponsorEditFormComponent } from '@/sponsors/components/sponsor-edit-form/sponsor-edit-form.component';

@Component({
  selector: 'app-sponsor-browser',
  templateUrl: './sponsor-browser.component.html',
  styleUrls: ['./sponsor-browser.component.scss']
})
export class SponsorBrowserComponent implements OnInit {
  protected errors: any[] = [];
  protected fa = fa;
  protected isLoading = false;
  protected parentSponsors: SponsorWithChildSponsors[] = [];
  protected nonParentSponsors: Sponsor[] = [];

  constructor(
    private api: SponsorService,
    private toastsService: ToastService) { }

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async update(s: ChangedSponsor): Promise<void> {
    this.isLoading = true;
    await firstValueFrom(this.api.update(s));
    await this.reload();
    this.isLoading = false;
  }

  async delete(s: Sponsor): Promise<void> {
    this.isLoading = true;
    await firstValueFrom(this.api.delete(s.id));
    await this.reload();
    this.isLoading = false;
  }

  async reload(): Promise<void> {
    this.isLoading = true;

    const response = await firstValueFrom(this.api.listByParent());
    this.parentSponsors = response.parentSponsors;
    this.nonParentSponsors = response.nonParentSponsors;

    this.isLoading = false;
  }

  protected async handleSponsorSaved(sponsor: Sponsor) {
    this.toastsService.showMessage(`Saved sponsor "${sponsor.name}".`);
    await this.reload();
  }
}
