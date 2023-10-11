// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Game } from "./game-models";
import { Player } from "./player-models";
import { ApiUser } from "./user-models";

export interface Search {
  term?: string;
  sort?: string;
  sortDirection?: SortDirection;
  skip?: number;
  take?: number;
  filter?: string[];
}

export type SortDirection = "asc" | "desc";

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

export interface PagingArgs {
  pageNumber?: number;
  pageSize?: number;
}

export interface PagingResults {
  itemCount: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedArray<T> {
  items: T[];
  paging: PagingResults;
}

export interface PlayerWithAvatar {
  id: string;
  name: string;
  avatarFile: string;
}

export interface SimpleEntity {
  id: string;
  name: string;
}

export interface ApiError {
  message: string;
}
