// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ChallengeResult } from "./board-models";
import { Game } from "./game-models";
import { Search } from "./models";

export interface Player {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userApprovedName: string;
  userNameStatus: string;
  gameId: string;
  gameName: string;
  name: string;
  nameStatus: string;
  approvedName: string;
  sponsor: string;
  role: PlayerRole;
  mode: PlayerMode;
  sessionBegin: Date;
  sessionEnd: Date;
  sessionMinutes: number;
  session?: TimeWindow;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  isManager: boolean;
  advanced: boolean;
  sponsorLogo: string;
  sponsorList: string[];
  pendingName: string;
  checked: boolean;
}

export interface PlayerOverview {
  id: string;
  teamId: string;
  gameId: string;
  gameName: string;
  approvedName: string;
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

// export enum TimeWindowState {
//   Before,
//   During,
//   After
// }

// export class TimeWindow {
//   now!: Date;
//   start!: Date;
//   end!: Date
//   duration!: number;
//   state!: TimeWindowState;
//   timeUntilStart!: number;
//   timeUntilEnd!: number;

//   // convenience properties for templates
//   readonly isBefore: boolean;
//   readonly isDuring: boolean;
//   readonly isAfter: boolean;

//   constructor() {
//     this.isBefore = this.state === TimeWindowState.Before;
//     this.isDuring = this.state === TimeWindowState.During;
//     this.isAfter = this.state === TimeWindowState.After;
//   }
// }

export interface HubPlayer extends Player {
  userApprovedName: string;
  userName: string;
  pendingName: string;
  userNameStatus: string;
  session?: TimeWindow
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
  nameStatus: string;
  approvedName: string;
  sponsor: string;
  role: PlayerRole;
}

export interface ObservePlayer {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  gameId: string;
  name: string;
  approvedName: string;
  sponsor: string;
  sessionBegin: Date;
  sessionEnd: Date;
  sessionMinutes: number;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  sponsorLogo: string;
  session: TimeWindow;

  expanded: boolean;
  pinned: boolean;
  fullWidth: boolean;
}

export interface SelfChangedPlayer {
  id: string;
  name: string;
}

export interface SessionChangeRequest {
  teamId: string;
  sessionEnd: string;
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
  advanced: boolean;
  sponsorList: string[];
  sponsorTooltip: string;
}

export interface TeamInvitation {
  code: string;
}

export interface TeamAdvancement {
  teamIds: string[];
  gameId: string;
  withScores: boolean;
  nextGameId: string;
}

export interface Team {
  teamId: string;
  gameId: string;
  sessionBegin: string;
  sessionEnd: string;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  challenges: TeamChallenge[];
  members: TeamMember[];
  sponsorList: string[];
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

export interface TeamPlayer {
  id: string;
  teamId: string;
  userName: string;
  userApprovedName: string;
  name: string;
  nameStatus: string;
  approvedName: string;
  sponsor: string;
  role: PlayerRole;
  isManager: boolean;
  sponsorLogo: string;
  pendingName: string;
}

export interface TeamState {
  teamId: string;
  name: string;
  approvedName: string;
  sessionBegin: Date;
  sessionEnd: Date;
  actor: { userId: string };
}

export interface TeamSummary {
  id: string;
  name: string;
  sponsor: string;
  sponsorLogo: string;
  members: string[];
}

export interface ObserveTeam {
  teamId: string;
  approvedName: string;
  gameId: string;
  sponsor: string;
  sessionBegin: Date;
  sessionEnd: Date;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  members: ObserveTeamMember[];
  expanded: boolean;
  pinned: boolean;
}

export interface ObserveTeamMember {
  id: string;
  approvedName: string;
  role: PlayerRole;
  minimized: boolean;
  fullWidth: boolean;
}

export interface PlayerCertificate {
  game: Game;
  player: Player;
  html: string;
}

export interface PlayerSearch extends Search {
  tid?: string;
  gid?: string;
  uid?: string;
  org?: string;
  mode?: string;
}

export enum PlayerRole {
  member = 'member',
  manager = 'manager'
}

export enum PlayerMode {
  competition = 'competition',
  practice = 'practice'
}
