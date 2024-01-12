import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamEventHorizonComponent } from './components/team-event-horizon/team-event-horizon.component';

const PUBLIC_DECLARATIONS = [
  TeamEventHorizonComponent
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ...PUBLIC_DECLARATIONS
  ]
})
export class EventHorizonModule { }
