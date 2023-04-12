import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { LinkifyHtmlPipe } from './pipes/linkify-html.pipe';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { ModalConfirmDirective } from './directives/modal-confirm.directive';
import { PlayerStatusComponent } from './components/player-status/player-status.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { YamlPipe } from './pipes/yaml.pipe';

const PUBLIC_DECLARATIONS = [
  LinkifyHtmlPipe,
  LongContentHiderComponent,
  ModalConfirmComponent,
  ModalConfirmDirective,
  PlayerAvatarComponent,
  PlayerAvatarListComponent,
  PlayerStatusComponent,
  RelativeUrlsPipe,
  SafeHtmlPipe,
  SpinnerComponent,
  UrlRewritePipe,
  YamlBlockComponent,
  YamlPipe
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS
  ],
  imports: [
    CommonModule,
    TooltipModule
  ],
  exports: [
    ...PUBLIC_DECLARATIONS,
    TooltipModule
  ]
})
export class CoreModule { }
