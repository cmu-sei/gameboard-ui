import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { GameboardSignalRHubsComponent } from '@/components/gameboard-signalr-hubs/gameboard-signalr-hubs.component';
import { AppNavComponent } from '@/components/nav/nav.component';
import { SponsorSelectBannerComponent } from '@/components/sponsor-select-banner/sponsor-select-banner.component';
import { SystemNotificationsModule } from '@/system-notifications/system-notifications.module';
import { MessageBoardComponent } from '@/utility/components/message-board/message-board.component';
import { LayoutService } from '@/utility/layout.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    // angular dependencies
    CommonModule,
    RouterModule,

    // gb dependencies
    AppNavComponent,
    GameboardSignalRHubsComponent,
    MessageBoardComponent,
    SponsorSelectBannerComponent,
    SystemNotificationsModule,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  // services
  private readonly layoutService = inject(LayoutService);

  // state
  protected stickyMenu$: Observable<boolean>;

  constructor() {
    this.stickyMenu$ = this.layoutService.stickyMenu$;
  }

  ngOnInit() {

  }
}
