import { TocFile, TocService } from '@/api/toc.service';
import { ApiUser } from '@/api/user-models';
import { UserService as LocalUser } from '@/utility/user.service';
import { PracticeService } from '@/services/practice.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ConfigService } from '@/utility/config.service';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, map } from 'rxjs';
import { ReportsService } from '@/reports/reports.service';
import { RouterService } from '@/services/router.service';
import { fa } from '@/services/font-awesome.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class AppNavComponent implements OnInit {
  user$!: Observable<ApiUser | null>;
  toc$!: Observable<TocFile[]>;
  canAccessReporting$?: Observable<boolean>;
  customBackground = "";
  env: any;

  protected fa = fa;
  protected isPracticeModeEnabled = false;
  protected profileUrl?: string;

  constructor(
    private localUser: LocalUser,
    private config: ConfigService,
    @Inject(DOCUMENT) private document: Document,
    private practiceService: PracticeService,
    private reportsService: ReportsService,
    private routerService: RouterService,
    private toc: TocService,
    private title: Title,
    private unsub: UnsubscriberService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user$ = this.localUser.user$;
    this.toc$ = this.toc.toc$;
    this.title.setTitle(this.config.settings.appname || 'Gameboard');
    this.profileUrl = this.routerService.getProfileUrl();

    if (this.config.settings.custom_background) {
      this.document.body.classList.add(this.config.settings.custom_background);
      this.customBackground = this.config.settings.custom_background || 'custom-bg-black';
    }

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
