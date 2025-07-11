import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@/core/core.module';
import { RouterService } from '@/services/router.service';
import { AuthService } from '@/utility/auth.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { IfHasPermissionDirective } from '@/standalone/directives/if-has-permission.directive';

@Component({
    selector: 'app-user-nav-item',
    imports: [
        CoreModule,
        RouterModule,
        IfHasPermissionDirective
    ],
    templateUrl: './user-nav-item.component.html',
    styleUrls: ['./user-nav-item.component.scss']
})
export class UserNavItemComponent implements OnInit {
  private authService = inject(AuthService);
  private localUser = inject(LocalUserService);
  private modalService = inject(ModalConfirmService);
  private routerService = inject(RouterService);

  protected localUser$ = this.localUser.user$.asObservable();
  protected profileLinks?: {
    certificates: string;
    history: string;
    profile: string;
  };

  async ngOnInit() {
    this.profileLinks = {
      certificates: this.routerService.getCertificateListUrl(),
      history: this.routerService.getPlayHistoryUrl(),
      profile: this.routerService.getProfileUrl()
    };
  }

  protected async handleLogIn() {
    await this.authService.login(this.routerService.getLocation());
  }

  protected handleLogOut() {
    this.modalService.openConfirm({
      title: "Log out?",
      subtitle: this.localUser.user$.value?.approvedName || "",
      bodyContent: "Everyone needs a break. Are you sure you want to **log out** now?",
      renderBodyAsMarkdown: true,
      onConfirm: () => this.authService.logout()
    });
  }
}
