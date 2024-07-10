import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupportPageComponent } from './support-page/support-page.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { TicketListPageComponent } from './components/ticket-list-page/ticket-list-page.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '', component: SupportPageComponent, children: [
          { path: '', pathMatch: 'full', redirectTo: 'tickets' },
          { path: 'create', component: TicketFormComponent, title: "New Ticket" },
          { path: 'tickets', component: TicketListPageComponent, title: "Support" },
          { path: 'tickets/:id', component: TicketDetailsComponent },
        ]
      },
    ]),
  ]
})
export class SupportRoutingModule { }
