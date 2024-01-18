import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamEventHorizonComponent } from './components/team-event-horizon/team-event-horizon.component';
import { CoreModule } from '@/core/core.module';
import { EventTypeToFriendlyNamePipe } from './pipes/event-type-to-friendly-name.pipe';

const PUBLIC_DECLARATIONS = [
  TeamEventHorizonComponent
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS,
    EventTypeToFriendlyNamePipe,
  ],
  imports: [
    CommonModule,
    CoreModule,
  ],
  exports: [
    ...PUBLIC_DECLARATIONS
  ]
})
export class EventHorizonModule { }
