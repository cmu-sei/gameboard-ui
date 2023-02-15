import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { LinkifyHtmlPipe } from './pipes/linkify-html.pipe';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { ModalConfirmComponent } from './components/modal/modal-confirm.component';
import { ModalConfirmDirective } from './directives/modal-confirm.directive';

@NgModule({
  declarations: [
    LinkifyHtmlPipe,
    LongContentHiderComponent,
    ModalConfirmComponent,
    ModalConfirmDirective,
    PlayerAvatarComponent,
    RelativeUrlsPipe,
    UrlRewritePipe,
    PlayerAvatarListComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LinkifyHtmlPipe,
    LongContentHiderComponent,
    ModalConfirmComponent,
    ModalConfirmDirective,
    PlayerAvatarComponent,
    PlayerAvatarListComponent,
    RelativeUrlsPipe,
    UrlRewritePipe,
  ]
})
export class CoreModule { }
