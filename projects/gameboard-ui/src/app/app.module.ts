// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { Observable } from 'rxjs';
import { ApiModule } from './api/api.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigService } from './utility/config.service';
import { UserService as CurrentUserService } from './utility/user.service';
import { UtilityModule } from './utility/utility.module';
import { SupportPillComponent } from './support/support-pill/support-pill.component';
import { CoreModule } from './core/core.module';
import { ModalConfirmService } from './services/modal-confirm.service';
import { NotificationService } from './services/notification.service';
import { AuthService } from './utility/auth.service';
import { UserService } from './api/user.service';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NAVIGATOR } from './services/navigator.service';

import { AppNavComponent } from './components/nav/nav.component';
import { SponsorSelectBannerComponent } from './components/sponsor-select-banner/sponsor-select-banner.component';
import { GameboardSignalRHubsComponent } from './components/gameboard-signalr-hubs/gameboard-signalr-hubs.component';
import { SignalRService } from './services/signalR/signalr.service';
import { LogService } from './services/log.service';
import { SystemNotificationsModule } from './system-notifications/system-notifications.module';

@NgModule({
  declarations: [
    AppComponent,
    AppNavComponent,
    SponsorSelectBannerComponent,
    SupportPillComponent,
    GameboardSignalRHubsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    ApiModule,
    FontAwesomeModule,
    SystemNotificationsModule,
    CoreModule,
    UtilityModule,
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    ProgressbarModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadSettings,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: SignalRService,
      useFactory: (config: ConfigService, log: LogService, userService: UserService) => new SignalRService(config, log, userService),
      deps: [ConfigService, LogService, UserService],
    },
    {
      provide: [NotificationService],
      useFactory: () => NotificationService,
      deps: [
        AuthService,
        ConfigService,
        CurrentUserService,
        UserService
      ]
    },
    {
      provide: NAVIGATOR,
      useValue: navigator
    },
    {
      provide: ModalConfirmService,
      useFactory: (bsModalService: BsModalService) => new ModalConfirmService(bsModalService),
      deps: [BsModalService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function loadSettings(
  config: ConfigService,
): (() => Observable<any>) {
  return (): Observable<any> => config.load();
}
