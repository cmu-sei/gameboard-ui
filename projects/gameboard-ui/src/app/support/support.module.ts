// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UtilityModule } from '../utility/utility.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../utility/auth.guard';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { MarkdownModule } from 'ngx-markdown';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { SupportPageComponent } from './support-page/support-page.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
  declarations: [
    TicketFormComponent,
    TicketDetailsComponent,
    TicketListComponent,
    SupportPageComponent
  ],
  exports: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: SupportPageComponent, children: [
        { path: '', pathMatch: 'full', redirectTo: 'tickets' },
        { path: 'create', component: TicketFormComponent },
        { path: 'tickets', component: TicketListComponent },
        { path: 'tickets/:id', component: TicketDetailsComponent }
      ]},
    ]),
    UtilityModule,
    FontAwesomeModule,
    AlertModule,
    MarkdownModule,
    ButtonsModule,
    ModalModule,
    TooltipModule
  ]
})
export class SupportModule { }
