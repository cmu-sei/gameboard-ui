// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { MarkdownModule } from 'ngx-markdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CoreModule } from '@/core/core.module';
import { UtilityModule } from '../utility/utility.module';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { SupportPageComponent } from './support-page/support-page.component';
import { TicketSupportToolsComponent } from './components/ticket-support-tools/ticket-support-tools.component';
import { EventHorizonModule } from '@/event-horizon/event-horizon.module';
import { TicketLabelPickerModalComponent } from './components/ticket-label-picker-modal/ticket-label-picker-modal.component';
import { TicketListPageComponent } from './components/ticket-list-page/ticket-list-page.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    SupportPageComponent,
    TicketDetailsComponent,
    TicketFormComponent,
    TicketSupportToolsComponent,
    TicketLabelPickerModalComponent,
    TicketListPageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '', component: SupportPageComponent, children: [
          { path: 'create', component: TicketFormComponent, title: "New Ticket" },
          { path: 'tickets', component: TicketListPageComponent, title: "Support" },
          { path: 'tickets/:id', component: TicketDetailsComponent },
          { path: '', pathMatch: 'full', redirectTo: 'tickets' },
        ]
      },
    ]),
    CoreModule,
    UtilityModule,
    FontAwesomeModule,
    AlertModule,
    MarkdownModule,
    ButtonsModule,
    ModalModule,
    TooltipModule,
    EventHorizonModule
  ],
})
export class SupportModule { }
