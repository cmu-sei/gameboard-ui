// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HttpInterceptorService } from './http-interceptor.service';
import { RouterModule } from '@angular/router';
import { SpacesPipe } from './spaces.pipe';
import { ConsoleComponent } from './components/console/console.component';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { UserActivityListenerComponent } from './components/user-activity-listener/user-activity-listener.component';

@NgModule({ declarations: [
        AppComponent,
        SpacesPipe,
        ConsoleComponent,
        SpinnerComponent,
        UserActivityListenerComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        RouterModule.forRoot([], { anchorScrolling: "enabled" }),
        MarkdownModule.forRoot()], providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpInterceptorService,
            multi: true,
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
