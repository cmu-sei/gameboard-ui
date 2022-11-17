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
import { AgedDatePipe } from './pipes/aged-date.pipe';
import { CamelspacePipe } from './pipes/camelspace.pipe';
import { CountdownPipe } from './pipes/countdown.pipe';
import { ShortDatePipe } from './pipes/short-date.pipe';
import { ShortTimePipe } from './pipes/short-time.pipe';
import { UntagPipe } from './pipes/untag.pipe';
import { DropzoneComponent } from './components/dropzone/dropzone.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { GameCardComponent } from './components/game-card/game-card.component';
import { YamlPipe } from './pipes/yaml.pipe';
import { LoginComponent } from './components/login/login.component';
import { ClockPipe } from './pipes/clock.pipe';
import { CountdownColorPipe } from './pipes/countdown-color.pipe';
import { ProfileEditorComponent } from './components/profile-editor/profile-editor.component';
import { FormsModule } from '@angular/forms';
import { MessageBoardComponent } from './components/message-board/message-board.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { ObserveOrderPipe } from './pipes/observe-order.pipe';
import { MatchesTermPipe } from './pipes/matches-term.pipe';
import { ImageManagerComponent } from './components/image-manager/image-manager.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { InplaceEditorComponent } from './components/inplace-editor/inplace-editor.component';
import { TextToColorPipe } from './pipes/text-to-color.pipe';
import { UntilPipe } from './pipes/until-date.pipe';
import { RouterModule } from '@angular/router';
import { ImagestackComponent } from './components/imagestack/imagestack.component';
import { MorphingTextComponent } from './components/morphing-text/morphing-text.component';

const components = [
  ClipspanComponent,
  ConfirmButtonComponent,
  ErrorDivComponent,
  SpinnerComponent,
  DropzoneComponent,
  ImageManagerComponent,
  GameCardComponent,
  LoginComponent,
  ProfileEditorComponent,
  MessageBoardComponent,
  InplaceEditorComponent,
  AgedDatePipe,
  UntilPipe,
  CamelspacePipe,
  CountdownPipe,
  CountdownColorPipe,
  ShortDatePipe,
  ShortTimePipe,
  UntagPipe,
  YamlPipe,
  ClockPipe,
  SafeUrlPipe,
  ObserveOrderPipe,
  MatchesTermPipe,
  TextToColorPipe,
  ImagestackComponent,
  MorphingTextComponent
]

@NgModule({
  declarations: [...components],
  exports: [...components],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    AlertModule,
    ModalModule,
    TooltipModule,
    ButtonsModule,
    BsDropdownModule,
    RouterModule
  ],
})
export class UtilityModule { }
