// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoreModule } from '../core/core.module';

// internal components/services
import { ClipspanComponent } from './components/clipspan/clipspan.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { ImageManagerComponent } from './components/image-manager/image-manager.component';
import { InplaceEditorComponent } from './components/inplace-editor/inplace-editor.component';

import { LoginComponent } from './components/login/login.component';

import { FormsModule } from '@angular/forms';
import { MatchesTermPipe } from './pipes/matches-term.pipe';
import { ObserveOrderPipe } from './pipes/observe-order.pipe';
import { ShortTimePipe } from './pipes/short-time.pipe';
import { UntilPipe } from './pipes/until-date.pipe';

import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { GameInfoBubblesComponent } from "../standalone/games/components/game-info-bubbles/game-info-bubbles.component";
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';
import { ErrorDivComponent } from '@/standalone/core/components/error-div/error-div.component';
import { RelativeImagePipe } from '@/core/pipes/relative-image.pipe';

const components = [
  ClipspanComponent,
  ImageManagerComponent,
  GameCardComponent,
  LoginComponent,
  InplaceEditorComponent,
  UntilPipe,
  ShortTimePipe,
  ObserveOrderPipe,
  MatchesTermPipe,
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
    ProgressbarModule,
    RouterModule,
    CoreModule,

    // standalones
    ErrorDivComponent,
    GameInfoBubblesComponent,
    RelativeImagePipe,
    SpinnerComponent
  ],
})
export class UtilityModule { }
