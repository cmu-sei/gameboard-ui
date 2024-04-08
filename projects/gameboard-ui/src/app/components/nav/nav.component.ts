import { TocFile, TocService } from '@/api/toc.service';
import { ApiUser } from '@/api/user-models';
import { UserService as LocalUser } from '@/utility/user.service';
import { PracticeService } from '@/services/practice.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component, Inject, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ReportsService } from '@/reports/reports.service';
import { RouterService } from '@/services/router.service';
import { fa } from '@/services/font-awesome.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  providers: [UnsubscriberService]
})
export class AppNavComponent implements OnInit {
  user$!: Observable<ApiUser | null>;
  toc$!: Observable<TocFile[]>;
  canAccessReporting$?: Observable<boolean>;
  customBackground = "";
  env: any;

  protected fa = fa;
  protected isCollapsed = false;
  protected isPracticeModeEnabled = false;
  protected profileUrl?: string;

  constructor(
    private localUser: LocalUser,
    private practiceService: PracticeService,
    private reportsService: ReportsService,
    private routerService: RouterService,
    private toc: TocService,
    private unsub: UnsubscriberService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user$ = this.localUser.user$;
    this.toc$ = this.toc.toc$;
    this.profileUrl = this.routerService.getProfileUrl();

    // set availability of practice/reporting
    this.canAccessReporting$ = this
      .localUser
      .user$
      .pipe(map(u => this.reportsService.canAccessReporting(u)));

    this.isPracticeModeEnabled = await this.practiceService.isEnabled();
    this.unsub.add(this.practiceService.isEnabled$.subscribe(isEnabled => this.updatePracticeModeEnabled(isEnabled)));
  }

  private updatePracticeModeEnabled(isEnabled: boolean) {
    this.isPracticeModeEnabled = isEnabled;
  }

  logout(): void {
    this.localUser.logout();
  }
}
