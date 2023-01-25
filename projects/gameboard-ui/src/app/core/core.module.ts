import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LongContentHiderComponent } from './components/long-content-hider/long-content-hider.component';
import { LinkifyHtmlPipe } from './pipes/linkify-html.pipe';
import { RelativeUrlsPipe } from './pipes/relative-urls.pipe';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { UrlRewritePipe } from './pipes/url-rewrite.pipe';
import { PlayerAvatarListComponent } from './components/player-avatar-list/player-avatar-list.component';
import { YamlBlockComponent } from './components/yaml-block/yaml-block.component';
import { YamlPipe } from './pipes/yaml.pipe';

const PUBLIC_DECLARATIONS = [
  LinkifyHtmlPipe,
  LongContentHiderComponent,
  PlayerAvatarComponent,
  PlayerAvatarListComponent,
  RelativeUrlsPipe,
  UrlRewritePipe,
  YamlBlockComponent,
  YamlPipe
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
export class CoreModule { }
