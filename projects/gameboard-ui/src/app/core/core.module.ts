import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { GbProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { LinkRendererPipe } from './pipes/link-renderer.pipe';
import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { ModalConfirmDirective } from './directives/modal-confirm.directive';
import { NumbersToPercentage } from './pipes/numbers-to-percentage.pipe';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { PlayerStatusComponent } from './components/player-status/player-status.component';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { RenderLinksInTextComponent } from './components/render-links-in-text/render-links-in-text.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ToggleSwitchComponent } from './components/toggle-switch/toggle-switch.component';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { YamlPipe } from './pipes/yaml.pipe';
import { CustomInputComponent } from './components/custom-input/custom-input.component';

const PUBLIC_DECLARATIONS = [
  GbProgressBarComponent,
  LinkRendererPipe,
  LongContentHiderComponent,
  ModalConfirmComponent,
  ModalConfirmDirective,
  PlayerAvatarComponent,
  PlayerAvatarListComponent,
  PlayerStatusComponent,
  NumbersToPercentage,
  RelativeUrlsPipe,
  RenderLinksInTextComponent,
  SpinnerComponent,
  UrlRewritePipe,
  ToggleSwitchComponent,
  YamlBlockComponent,
  YamlPipe
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProgressbarModule,
    TooltipModule
  ],
  exports: [
    ...PUBLIC_DECLARATIONS,
    ProgressbarModule,
    TooltipModule
  ]
})
export class CoreModule { }
