import { TocFile, TocService } from '@/api/toc.service';
import { ApiUser } from '@/api/user-models';
import { UserService as LocalUser } from '@/utility/user.service';
import { PracticeService } from '@/services/practice.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ConfigService } from '@/utility/config.service';
import { LayoutService } from '@/utility/layout.service';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class AppNavComponent implements OnInit {
  user$!: Observable<ApiUser | null>;
  toc$!: Observable<TocFile[]>;
  customBackground = "";
  env: any;
  isPracticeModeEnabled = false;

  constructor(
    private localUser: LocalUser,
    private config: ConfigService,
    @Inject(DOCUMENT) private document: Document,
    public layoutService: LayoutService,
    private practiceService: PracticeService,
    private toc: TocService,
    private title: Title,
    private unsub: UnsubscriberService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user$ = this.localUser.user$;
    this.toc$ = this.toc.toc$;
    this.title.setTitle(this.config.settings.appname || 'Gameboard');

    if (this.config.settings.custom_background) {
      this.document.body.classList.add(this.config.settings.custom_background);
      this.customBackground = this.config.settings.custom_background;
    }

    this.unsub.add(this.practiceService.isEnabled$.subscribe(isEnabled => this.updatePracticeModeEnabled(isEnabled)));
    this.isPracticeModeEnabled = await this.practiceService.isEnabled();
  }

  private updatePracticeModeEnabled(isEnabled: boolean) {
    this.isPracticeModeEnabled = isEnabled;
  }

  logout(): void {
    this.localUser.logout();
  }
}
