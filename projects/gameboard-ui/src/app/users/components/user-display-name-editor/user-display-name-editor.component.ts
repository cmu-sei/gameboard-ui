import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertModule } from 'ngx-bootstrap/alert';
import { fa } from '@/services/font-awesome.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { UserService as LocalUserService } from '@/utility/user.service';
import { UserService } from '@/api/user.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ConfigService } from '@/utility/config.service';
import { SettingsService } from '@/api/settings.service';
import { GameboardSettings } from '@/api/settings.models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';
import { ToastService } from '@/utility/services/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-display-name-editor',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    AlertModule,
    TooltipModule,
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: './user-display-name-editor.component.html',
  styleUrl: './user-display-name-editor.component.scss'
})
export class UserDisplayNameEditorComponent implements OnInit {
  private configService = inject(ConfigService);
  private localUserService = inject(LocalUserService);
  private permissions = inject(UserRolePermissionsService);
  private settingsService = inject(SettingsService);
  private toasts = inject(ToastService);
  private unsub = inject(UnsubscriberService);
  private usersService = inject(UserService);

  protected appName = this.configService.appName;
  protected currentUser$ = this.localUserService.user$;
  protected requestedName = "";
  protected fa = fa;
  protected settings?: GameboardSettings;

  public async ngOnInit() {
    this.unsub.add(this.usersService.nameChanged$.subscribe(async change => {
      if (change.userId === this.localUserService.user$.value?.id) {
        await this.bindNameStatus();
      }
    }));
    this.settings = await this.settingsService.get();
    this.bindNameStatus();
  }

  protected async handleRefreshClick() {
    await this.bindNameStatus();
  }

  protected async handleSubmitClick() {
    if (!this.localUserService.user$.value)
      throw new Error("Can't update user name if not logged in.");

    if (!this.requestedName) {
      return;
    }

    await this.usersService.requestNameChange(this.localUserService.user$.value.id, { requestedName: this.requestedName });
    await this.bindNameStatus();

    if (this.permissions.can("Teams_ApproveNameChanges")) {
      this.toasts.showMessage(`Your display name is now **${this.currentUser$.value?.approvedName}**. Nice!`);
    } else {
      this.toasts.showMessage("Your name change request has been submitted.");
    }
  }

  private async bindNameStatus() {
    await firstValueFrom(this.localUserService.refresh$);
    this.requestedName = this.currentUser$.value?.name || "";
  }
}
