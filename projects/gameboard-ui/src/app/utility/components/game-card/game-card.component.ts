// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fa } from '@/services/font-awesome.service';

export type GameCardGame = {
  id: string;
  name: string;
  cardText1?: string;
  cardText2?: string;
  cardText3?: string;
  logo: string;
}

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss'],
  standalone: false
})
export class GameCardComponent {
  @Input() game?: GameCardGame;
  @Input() isClickable = false;
  @Output() selected = new EventEmitter<GameCardGame>();

  protected fa = fa;

  select(): void {
    if (this.isClickable) {
      this.selected.emit(this.game);
    }
  }
}
