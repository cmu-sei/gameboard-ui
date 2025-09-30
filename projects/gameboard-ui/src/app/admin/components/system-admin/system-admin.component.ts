// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '@/utility/config.service';
import { CoreModule } from '@/core/core.module';
import { AdminRolesComponent } from '../admin-roles/admin-roles.component';
import { ExportBatchesComponent } from '../export-batches/export-batches.component';
import { GameHubService } from '@/services/signalR/game-hub.service';
import { SupportHubService } from '@/services/signalR/support-hub.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Environment } from 'projects/gameboard-ui/src/environments/environment-typed';

type SystemAdminTab = "permissions" | "export" | "debug";

@Component({
  selector: 'app-system-admin',
  imports: [
    CommonModule,
    CoreModule,
    AdminRolesComponent,
    ExportBatchesComponent
  ],
  providers: [UnsubscriberService],
  templateUrl: './system-admin.component.html',
  styleUrls: ['./system-admin.component.scss']
})
export class SystemAdminComponent implements OnInit {
  private readonly configService = inject(ConfigService);
  private readonly route = inject(ActivatedRoute);
  private readonly unsub = inject(UnsubscriberService);

  protected readonly appName = inject(ConfigService).appName;
  protected readonly gameHubState$ = inject(GameHubService).hubState$;
  protected readonly supportHubState$ = inject(SupportHubService).hubState$;

  protected appConfigSettings?: Environment;
  protected selectedTab: SystemAdminTab = "permissions";

  ngOnInit(): void {
    this.unsub.add(
      this.route.params.subscribe(p => {
        this.selectedTab = p.tab || "permissions";
      })
    );

    this.appConfigSettings = this.configService.environment;
  }
}
