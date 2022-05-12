// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faUser, faUsers, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { BoardGame } from '../../../api/board-models';
import { Game } from '../../../api/game-models';
import { ConfigService } from '../../config.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent implements OnInit {
  @Input() game!: Game | BoardGame;
  @Output() selected = new EventEmitter<Game | BoardGame>();

  faUser = faUser;
  faUsers = faUsers;
  faEyeSlash = faEyeSlash;

  constructor(
    private config: ConfigService
  ) { }

  ngOnInit(): void {
    if (this.game) {
      this.game.cardUrl = this.game.logo
        ? `${this.config.imagehost}/${this.game.logo}`
        : `${this.config.basehref}assets/card.png`
      ;

      this.game.modeUrl = this.game.mode
        ? `${this.config.basehref}assets/${this.game.mode}.png`
        : `${this.config.basehref}assets/vm.png`
      ;
    }
  }

  setModeUrlPath() {
    this.game.modeUrl = '';
  }

  select(): void {
    this.selected.next(
      this.game
    );
  }
}
