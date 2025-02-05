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

type SystemAdminTab = "permissions" | "export" | "debug";

@Component({
  selector: 'app-system-admin',
  standalone: true,
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
  private route = inject(ActivatedRoute);
  private unsub = inject(UnsubscriberService);

  protected appName = inject(ConfigService).appName;
  protected gameHubState$ = inject(GameHubService).hubState$;
  protected selectedTab: SystemAdminTab = "permissions";
  protected supportHubState$ = inject(SupportHubService).hubState$;

  ngOnInit(): void {
    this.unsub.add(
      this.route.params.subscribe(p => {
        this.selectedTab = p.tab || "permissions";
      })
    );
  }
}
