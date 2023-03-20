// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Game } from "./game-models";
import { Player } from "./player-models";
import { ApiUser } from "./user-models";

export interface Search {
  term?: string;
  sort?: string;
  skip?: number;
  take?: number;
  filter?: string[];
}

export interface GameContext {
  game: Game;
  player: Player;
  user: ApiUser;
}

export interface GameEnrollmentContext {
  game: Game;
  user: ApiUser;
  player: Player | undefined;
}

export interface SimpleEntity {
  id: string;
  name: string;
}
