import { Observable } from 'rxjs';
import { TocFile, TocService } from '@/api/toc.service';
import { ApiUser } from '@/api/user-models';
import { UserService as LocalUser } from '@/utility/user.service';
import { PracticeService } from '@/services/practice.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Component, inject, OnInit } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { AuthService } from '@/utility/auth.service';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  providers: [UnsubscriberService]
})
export class AppNavComponent implements OnInit {
  private authService = inject(AuthService);
  private routerService = inject(RouterService);

  user$!: Observable<ApiUser | null>;
  toc$!: Observable<TocFile[]>;
  customBackground = "";
  env: any;

  protected fa = fa;
  protected isCollapsed = false;
  protected isPracticeModeEnabled = false;
  protected profileUrl = "";

  constructor(
    private localUser: LocalUser,
    private practiceService: PracticeService,
    private toc: TocService,
    private unsub: UnsubscriberService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user$ = this.localUser.user$;
    this.toc$ = this.toc.toc$;
    this.profileUrl = this.routerService.getProfileUrl();

    this.isPracticeModeEnabled = await this.practiceService.isEnabled();
    this.unsub.add(this.practiceService.isEnabled$.subscribe(isEnabled => this.updatePracticeModeEnabled(isEnabled)));
  }

  private updatePracticeModeEnabled(isEnabled: boolean) {
    this.isPracticeModeEnabled = isEnabled;
  }

  protected async handleLogIn() {
    await this.authService.login();
  }

  protected handleLogOut() {
    this.authService.logout();
  }
}
