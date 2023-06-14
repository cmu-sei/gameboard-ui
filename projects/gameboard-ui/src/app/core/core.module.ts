import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { LinkRendererPipe } from './pipes/link-renderer.pipe';
import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { RenderLinksInTextComponent } from './components/render-links-in-text/render-links-in-text.component';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { ModalConfirmDirective } from './directives/modal-confirm.directive';
import { PlayerStatusComponent } from './components/player-status/player-status.component';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { YamlPipe } from './pipes/yaml.pipe';

const PUBLIC_DECLARATIONS = [
  LinkRendererPipe,
  LongContentHiderComponent,
  ModalConfirmComponent,
  ModalConfirmDirective,
  PlayerAvatarComponent,
  PlayerAvatarListComponent,
  PlayerStatusComponent,
  RelativeUrlsPipe,
  RenderLinksInTextComponent,
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
