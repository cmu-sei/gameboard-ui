import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamEventHorizonComponent } from './components/team-event-horizon/team-event-horizon.component';
import { CoreModule } from '@/core/core.module';

const PUBLIC_DECLARATIONS = [
  TeamEventHorizonComponent
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS,
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
