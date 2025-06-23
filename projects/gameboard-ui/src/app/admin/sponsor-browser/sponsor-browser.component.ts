// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { firstValueFrom } from 'rxjs';
import { ChangedSponsor, Sponsor, SponsorWithChildSponsors } from '../../api/sponsor-models';
import { SponsorService } from '../../api/sponsor.service';
import { ToastService } from '@/utility/services/toast.service';

@Component({
    selector: 'app-sponsor-browser',
    templateUrl: './sponsor-browser.component.html',
    styleUrls: ['./sponsor-browser.component.scss'],
    standalone: false
})
export class SponsorBrowserComponent implements OnInit {
  protected errors: any[] = [];
  protected fa = fa;
  protected isLoading = false;
  protected sponsors: SponsorWithChildSponsors[] = [];

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
    this.sponsors = await firstValueFrom(this.api.listWithChildren());
    this.isLoading = false;
  }

  protected async handleSponsorSaved(sponsor: Sponsor) {
    this.toastsService.showMessage(`Saved sponsor "${sponsor.name}".`);
    await this.reload();
  }
}
