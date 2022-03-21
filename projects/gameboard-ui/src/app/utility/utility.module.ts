// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipspanComponent } from './components/clipspan/clipspan.component';
import { ConfirmButtonComponent } from './components/confirm-button/confirm-button.component';
import { ErrorDivComponent } from './components/error-div/error-div.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AgedDatePipe } from './pipes/aged-date.pipe';
import { CamelspacePipe } from './pipes/camelspace.pipe';
import { CountdownPipe } from './pipes/countdown.pipe';
import { CountdownColorPipe } from './pipes/countdown-color.pipe';
import { ShortDatePipe } from './pipes/short-date.pipe';
import { ShortTimePipe } from './pipes/short-time.pipe';
import { UntagPipe } from './pipes/untag.pipe';
import { DropzoneComponent } from './components/dropzone/dropzone.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { GameCardComponent } from './components/game-card/game-card.component';
import { YamlPipe } from './pipes/yaml.pipe';
import { LoginComponent } from './components/login/login.component';
import { ClipboardService } from './clipboard.service';
import { ClockPipe } from './pipes/clock.pipe';
import { ProfileEditorComponent } from './components/profile-editor/profile-editor.component';
import { FormsModule } from '@angular/forms';
import { MessageBoardComponent } from './components/message-board/message-board.component';

const components = [
  ClipspanComponent,
  ConfirmButtonComponent,
  ErrorDivComponent,
  SpinnerComponent,
  DropzoneComponent,
  GameCardComponent,
  LoginComponent,
  ProfileEditorComponent,
  MessageBoardComponent,
  AgedDatePipe,
  CamelspacePipe,
  CountdownPipe,
  CountdownColorPipe,
  ShortDatePipe,
  ShortTimePipe,
  UntagPipe,
  YamlPipe,
  ClockPipe
]

@NgModule({
  declarations: [...components],
  exports: [...components],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    AlertModule,
    TooltipModule,
    ButtonsModule
  ],
})
export class UtilityModule { }
