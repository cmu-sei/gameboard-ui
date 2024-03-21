// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UtilityModule } from '../utility/utility.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { MarkdownModule } from 'ngx-markdown';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { SupportPageComponent } from './support-page/support-page.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CoreModule } from '../core/core.module';
import { TicketSupportToolsComponent } from './components/ticket-support-tools/ticket-support-tools.component';
import { EventHorizonModule } from '@/event-horizon/event-horizon.module';
import { TicketLabelPickerComponent } from './components/ticket-label-picker/ticket-label-picker.component';
import { TicketLabelPickerModalComponent } from './components/ticket-label-picker-modal/ticket-label-picker-modal.component';

@NgModule({
  declarations: [
    SupportPageComponent,
    TicketDetailsComponent,
    TicketFormComponent,
    TicketListComponent,
    TicketSupportToolsComponent,
    TicketLabelPickerComponent,
    TicketLabelPickerModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '', component: SupportPageComponent, children: [
          { path: '', pathMatch: 'full', redirectTo: 'tickets' },
          { path: 'create', component: TicketFormComponent, title: "New Ticket" },
          { path: 'tickets', component: TicketListComponent, title: "Support" },
          { path: 'tickets/:id', component: TicketDetailsComponent }
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
  ]
})
export class SupportModule { }
