import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SupportSettingsAutoTag, SupportSettingsAutoTagViewModel } from '@/api/support-models';
import { SimpleEntity } from '@/api/models';
import { slug } from "@/tools/functions";
import { SupportService } from '@/api/support.service';
import { SponsorService } from '@/api/sponsor.service';
import { SponsorWithChildSponsors } from '@/api/sponsor-models';

@Component({
  selector: 'app-support-auto-tag-admin',
  templateUrl: './support-auto-tag-admin.component.html',
  styleUrls: ['./support-auto-tag-admin.component.scss']
})
export class SupportAutoTagAdminComponent implements OnInit {
  protected autoTags: SupportSettingsAutoTagViewModel[] = [];
  protected conditionTypes: SimpleEntity[] = [
    { id: "challengeSpecId", name: "Challenge Spec" },
    { id: "gameId", name: "Game" },
    { id: "playerMode", name: "Mode" },
    { id: "sponsorId", name: "Sponsor" }
  ];
  protected isLoading = false;
  protected newAutoTag: SupportSettingsAutoTag = {
    conditionType: "challengeSpecId",
    conditionValue: "",
    isEnabled: true,
    tag: ""
  };
  protected sponsors: SponsorWithChildSponsors[] = [];

  constructor(
    private sponsorsService: SponsorService,
    private supportService: SupportService) { }

  async ngOnInit(): Promise<void> {
    this.autoTags = await this.supportService.getAutoTags();
    this.sponsors = await firstValueFrom(this.sponsorsService.listWithChildren());
  }

  protected async handleAddAutoTag() {
    this.isLoading = true;
    this.newAutoTag.tag = slug(this.newAutoTag.tag);
    await this.supportService.upsertAutoTag(this.newAutoTag);
    this.newAutoTag = { conditionType: "challengeSpecId", isEnabled: true, tag: "", conditionValue: "" };
    this.isLoading = false;
  }
}
