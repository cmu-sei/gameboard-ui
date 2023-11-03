// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoardGame } from '@/api/board-models';
import { Game } from '@/api/game-models';
import { fa } from '@/services/font-awesome.service';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent {
  @Input() game!: Game | BoardGame;
  @Output() selected = new EventEmitter<Game | BoardGame>();

  protected fa = fa;

  select(): void {
    this.selected.next(
      this.game
    );
  }
}
