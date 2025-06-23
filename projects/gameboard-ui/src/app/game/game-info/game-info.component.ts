// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { Game, GameRegistrationType } from '../../api/game-models';

@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
    standalone: false
})
export class GameInfoComponent implements OnInit {
  @Input() game!: Game;

  protected isRegistrationOpen = false;

  ngOnInit(): void {
    if (!this.game)
      return;

    this.isRegistrationOpen = this.game.registrationType != GameRegistrationType.none;
  }
}
