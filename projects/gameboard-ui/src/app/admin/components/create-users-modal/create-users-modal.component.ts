// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { UserService } from '@/api/user.service';
import { ConfigService } from '@/utility/config.service';
import { TryCreateUsersResponse, UserRoleKey } from '@/api/user-models';
import { SponsorService } from '@/api/sponsor.service';
import { SponsorWithChildSponsors } from '@/api/sponsor-models';
import { firstValueFrom } from 'rxjs';
import { GameService } from '@/api/game.service';
import { SimpleEntity } from '@/api/models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

@Component({
    selector: 'app-create-users-modal',
    templateUrl: './create-users-modal.component.html',
    styleUrls: ['./create-users-modal.component.scss'],
    standalone: false
})
export class CreateUsersModalComponent {
  onCreated?: (response: TryCreateUsersResponse) => void | Promise<void>;

  protected allowSubsetCreation = false;
  protected createWithRole?: UserRoleKey;
  protected createWithSponsorId?: string;
  protected unsetDefaultSponsorFlag = false;

  protected appName: string;
  protected enrollInGameId?: string;
  protected games: SimpleEntity[] = [];
  protected hasInvalidIds = false;
  protected invalidIds: string[] = [];
  protected isWorking = false;
  protected placeholder: string;
  protected rawText: string = "";
  protected roles: UserRoleKey[] = [];
  protected sponsors: SponsorWithChildSponsors[] = [];
  protected userIds: string[] = [];

  private invalidIdsRegex = /[a-fA-F0-9-]{2,}/;
  private onePerLineRegex = /\s+/gm;

  constructor(
    config: ConfigService,
    private gameService: GameService,
    private sponsorService: SponsorService,
    private usersService: UserService,
    private userRolePermissions: UserRolePermissionsService) {
    this.appName = config.appName;
    this.placeholder = "// one ID per line, e.g.:\n\n3496da07-d19e-440d-a246-e35f7b7bfcac\n9a53d8cd-ef88-44c0-96b2-fc8766b518dd\n// and so on";
  }

  async ngOnInit() {
    this.isWorking = true;

    this.games = (await firstValueFrom(this.gameService.list({ "orderBy": "name" }))).map(game => ({
      id: game.id,
      name: game.name
    }));
    this.sponsors = await firstValueFrom(this.sponsorService.listWithChildren());

    this.roles = await firstValueFrom(this.userRolePermissions.listRoles());
    if (this.roles.length) {
      this.createWithRole = this.roles.find(r => r == "member") || this.roles[0];
    }

    this.isWorking = false;
  }

  async confirm() {
    this.isWorking = true;
    const result = await this.usersService.tryCreateMany({
      allowSubsetCreation: this.allowSubsetCreation,
      enrollInGameId: this.enrollInGameId,
      role: this.createWithRole,
      sponsorId: this.createWithSponsorId,
      unsetDefaultSponsorFlag: this.unsetDefaultSponsorFlag,
      userIds: this.userIds
    });
    this.isWorking = false;

    if (this.onCreated)
      this.onCreated(result);
  }

  protected handleTextInput() {
    this.userIds = this.rawText
      .split(this.onePerLineRegex)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 2);

    this.invalidIds = [];
    for (const id of this.userIds) {
      if (!id.match(this.invalidIdsRegex)) {
        this.invalidIds.push(id);
      }
    }
  }
}
