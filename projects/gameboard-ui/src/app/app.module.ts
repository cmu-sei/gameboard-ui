// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideConsoleForge } from '@cmusei/console-forge';
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
import { CoreModule } from './core/core.module';
import { ModalConfirmService } from './services/modal-confirm.service';
import { NotificationService } from './services/notification.service';
import { AuthService } from './utility/auth.service';
import { UserService } from './api/user.service';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NAVIGATOR } from './services/navigator.service';

import { SignalRService } from './services/signalR/signalr.service';
import { LogService } from './services/log.service';
import { SystemNotificationsModule } from './system-notifications/system-notifications.module';
import { UserNavItemComponent } from './standalone/user/components/user-nav-item/user-nav-item.component';
import { markedOptionsFactory } from './core/config/marked.config';
import { MarkdownModule, MARKED_OPTIONS, provideMarkdown } from 'ngx-markdown';
import { ThemeBgDirective } from './core/directives/theme-bg.directive';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
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
    MarkdownModule.forRoot(),
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    ProgressbarModule.forRoot(),

    // standalones
    ThemeBgDirective,
    UserNavItemComponent
  ],
  providers: [
    provideAppInitializer(() => {
      const initializerFn = (loadSettings)(inject(ConfigService));
      return initializerFn();
    }),
    {
      provide: SignalRService,
      useFactory: (config: ConfigService, log: LogService, userService: UserService) => new SignalRService(config, log, userService),
      deps: [ConfigService, LogService, UserService],
    },
    provideConsoleForge(environment.settings.consoleForgeConfig),
    provideMarkdown({
      markedOptions: {
        provide: MARKED_OPTIONS,
        useFactory: markedOptionsFactory,
      },
    }),
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

export function loadSettings(config: ConfigService): (() => Observable<any>) {
  return (): Observable<any> => config.load();
}
