// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ChallengeResult } from "./board-models";
import { Search } from "./models";

export interface Player {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  gameId: string;
  approvedName: string;
  name: string;
  sponsor: string;
  role: PlayerRole;
  sessionBegin: Date;
  sessionEnd: Date;
  sessionMinutes: number;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  isManager: boolean;

  sponsorLogo: string;
  session: TimeWindow;
}

export class TimeWindow {
  isBefore: boolean;
  isDuring: boolean;
  isAfter: boolean;
  window: number;
  countdown: number;

  constructor(a: Date, b: Date) {
    const ts = new Date().valueOf();
    const start = new Date(a).valueOf();
    const end = new Date(b).valueOf();
    this.window = start > 0 && ts >= start ? end > 0 && ts > end ? 1 : 0 : -1;
    this.isBefore = this.window < 0;
    this.isDuring = this.window === 0;
    this.isAfter = this.window > 0;
    this.countdown = this.isBefore && start > 0
      ? start - ts
      : this.isDuring && end > 0
        ? end - ts
        : 0
    ;
  }
}

export interface NewPlayer {
  userId: string;
  gameId: string;
  name: string;
  sponsor: string;
}

export interface ChangedPlayer {
  id: string;
  name: string;
  sponsor: string;
  approvedName: string;
  role: PlayerRole;
}

export interface SelfChangedPlayer {
  id: string;
  name: string;
}

export interface PlayerEnlistment {
  playerId: string;
  userId: string;
  code: string;
}

export interface Standing {
  teamId: string;
  approvedName: string;
  sponsor: string;
  sessionBegin: Date;
  sessionEnd: Date;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  session: TimeWindow;
  sponsorLogo: string;
}

export interface TeamInvitation {
  code: string;
}

export interface TeamAdvancement {
  teamId: string;
  nextGameId: string;
}

export interface Team {
  teamId: string;
  gameId: string;
  sessionBegin: Date;
  sessionEnd: Date;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  challenges: TeamChallenge[];
  members: TeamMember[];
}
export interface TeamChallenge {
  id: string;
  name: string;
  tag: string;
  points: number;
  score: number;
  duration: number;
  result: ChallengeResult;
}
export interface TeamMember {
  id: string;
  approvedName: string;
  role: PlayerRole;
}

export interface PlayerSearch extends Search {
  tid?: string;
  gid?: string;
  uid?: string;
  org?: string;
}

export enum PlayerRole {
  member = 'member',
  manager = 'manager'
}
