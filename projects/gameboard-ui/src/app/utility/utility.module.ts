// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core.module';

// 3rd party modules
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// internal components/services
import { ClipspanComponent } from './components/clipspan/clipspan.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { ImageManagerComponent } from './components/image-manager/image-manager.component';
import { ImagestackComponent } from './components/imagestack/imagestack.component';
import { InplaceEditorComponent } from './components/inplace-editor/inplace-editor.component';

import { LoginComponent } from './components/login/login.component';
import { MessageBoardComponent } from './components/message-board/message-board.component';
import { MorphingTextComponent } from './components/morphing-text/morphing-text.component';

import { FormsModule } from '@angular/forms';
import { MatchesTermPipe } from './pipes/matches-term.pipe';
import { ObserveOrderPipe } from './pipes/observe-order.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { ShortTimePipe } from './pipes/short-time.pipe';
import { UntagPipe } from './pipes/untag.pipe';
import { UntilPipe } from './pipes/until-date.pipe';

import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { GameInfoBubblesComponent } from "../standalone/components/game-info-bubbles/game-info-bubbles.component";

const components = [
  ClipspanComponent,
  ImageManagerComponent,
  GameCardComponent,
  LoginComponent,
  MessageBoardComponent,
  InplaceEditorComponent,
  UntilPipe,
  ShortTimePipe,
  UntagPipe,
  SafeUrlPipe,
  ObserveOrderPipe,
  MatchesTermPipe,
  ImagestackComponent,
  MorphingTextComponent,
];

@NgModule({
  declarations: [...components],
  exports: [
    ...components,
    ProgressbarModule,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    AlertModule,
    ModalModule,
    ButtonsModule,
    BsDatepickerModule,
    BsDropdownModule,
    ProgressbarModule,
    TooltipModule,
    RouterModule,
    CoreModule,
    GameInfoBubblesComponent
  ],
})
export class UtilityModule { }
