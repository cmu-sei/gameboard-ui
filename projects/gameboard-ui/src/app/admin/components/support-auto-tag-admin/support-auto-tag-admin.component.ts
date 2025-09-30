// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SupportSettingsAutoTag, SupportSettingsAutoTagConditionType, SupportSettingsAutoTagViewModel } from '@/api/support-models';
import { SimpleEntity } from '@/api/models';
import { slug } from "@/../tools/functions";
import { SupportService } from '@/api/support.service';
import { SponsorService } from '@/api/sponsor.service';
import { GameService } from '@/api/game.service';
import { SpecService } from '@/api/spec.service';

@Component({
    selector: 'app-support-auto-tag-admin',
    templateUrl: './support-auto-tag-admin.component.html',
    styleUrls: ['./support-auto-tag-admin.component.scss'],
    standalone: false
})
export class SupportAutoTagAdminComponent implements OnInit {
  protected autoTags: SupportSettingsAutoTagViewModel[] = [];
  protected conditionTypes: SimpleEntity[] = [
    { id: "challengeSpecId", name: "Challenge Spec" },
    { id: "gameId", name: "Game" },
    { id: "playerMode", name: "Mode" },
    { id: "sponsorId", name: "Sponsor" }
  ];
  protected conditionValues: { id: string, name: string, isGroup?: boolean }[] = [];
  protected isLoading = false;
  protected newAutoTag: SupportSettingsAutoTag = {
    conditionType: "challengeSpecId",
    conditionValue: "",
    isEnabled: true,
    tag: ""
  };

  constructor(
    private gameService: GameService,
    private specService: SpecService,
    private sponsorsService: SponsorService,
    private supportService: SupportService) { }

  async ngOnInit(): Promise<void> {
    await this.load();
    await this.handleConditionTypeChange(this.newAutoTag.conditionType);
  }

  protected async handleAddAutoTag() {
    this.newAutoTag.tag = slug(this.newAutoTag.tag);
    await this.supportService.upsertAutoTag(this.newAutoTag);
    this.newAutoTag = { conditionType: "challengeSpecId", isEnabled: true, tag: "", conditionValue: "" };
    await this.load();
  }

  protected async handleConditionTypeChange(conditionType: SupportSettingsAutoTagConditionType) {
    this.conditionValues = [];

    switch (conditionType) {
      case "challengeSpecId": {
        const games = await this.specService.listByGame();

        for (const game of games) {
          this.conditionValues.push({ id: game.game.id, name: game.game.name, isGroup: true });

          for (const spec of game.challengeSpecs) {
            this.conditionValues.push({ isGroup: false, ...spec });
          }
        }

        break;
      }
      case "gameId": {
        this.conditionValues = await firstValueFrom(this.gameService.list());
        break;
      }
      case "playerMode": {
        this.conditionValues = [
          { id: "0", name: "Competition" },
          { id: "1", name: "Practice" },
        ];
        break;
      }
      case "sponsorId": {
        const sponsors = await firstValueFrom(this.sponsorsService.listWithChildren());

        for (const sponsor of sponsors) {
          this.conditionValues.push(sponsor);

          if (sponsor.childSponsors?.length) {
            for (const childSponsor of sponsor.childSponsors) {
              this.conditionValues.push({ id: childSponsor.id, name: ` - ${childSponsor.name}` });
            }
          }
        }
      }
    }
  }

  protected async handleDelete(tag: SupportSettingsAutoTagViewModel) {
    await this.supportService.deleteAutoTag(tag.id);
    await this.load();
  }

  private async load() {
    this.isLoading = true;
    this.autoTags = await this.supportService.getAutoTags();
    this.isLoading = false;
  }
}
