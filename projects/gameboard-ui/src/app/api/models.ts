// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SortDirection } from "@/core/models/sort-direction";
import { Game } from "./game-models";
import { Player } from "./player-models";
import { ApiUser } from "./user-models";
import { DateTime } from "luxon";

export interface DateTimeRange {
  start?: DateTime;
  end?: DateTime;
}

export interface Search {
  term?: string;
  sort?: string;
  sortDirection?: SortDirection;
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

export interface PlayerWithSponsor {
  id: string;
  name: string;
  sponsor: SimpleSponsor;
}

export interface SimpleSponsor {
  id: string;
  name: string;
  logo: string;
}

export interface SimpleEntity {
  id: string;
  name: string;
}

export interface TimestampRange {
  start?: number;
  end?: number;
}

export interface ApiError {
  message: string;
}
