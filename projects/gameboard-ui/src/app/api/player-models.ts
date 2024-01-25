// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ChallengeResult } from "./board-models";
import { Game } from "./game-models";
import { Search, SimpleEntity } from "./models";
import { Sponsor } from "./sponsor-models";

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
  sponsor: Sponsor;
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
  isLateStart: boolean;
  isManager: boolean;
  isReady: boolean;
  advanced: boolean;
  teamSponsorLogos: string[];
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
  isBefore: boolean = false;
  isDuring: boolean = false;
  isAfter: boolean = false;
  window: number = 0;
  countdown?: number;

  beginDate: Date;
  endDate: Date;

  constructor(a: Date, b: Date) {
    this.beginDate = new Date(a);
    this.endDate = new Date(b);

    this.updateWindow();
    this.countdown = calculateCountdown(this);
  }

  private updateWindow() {
    const ts = new Date().valueOf();
    const start = this.beginDate.valueOf();
    const end = this.endDate.valueOf();

    this.window = start > 0 && ts >= start ? end > 0 && ts > end ? 1 : 0 : -1;
    this.isBefore = this.window < 0;
    this.isDuring = this.window === 0;
    this.isAfter = this.window > 0;
  }
}

export const calculateCountdown = (window?: TimeWindow, now?: Date) => {
  if (!window || !window.beginDate || !window.endDate) {
    return undefined;
  }

  now = now || new Date();
  const start = window.beginDate.valueOf();
  const end = window.endDate.valueOf();
  const ts = now.valueOf();

  const result = window.isBefore && start > 0
    ? start - ts
    : window.isDuring && end > 0
      ? end - ts
      : 0
    ;

  return result;
};

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
}

export interface SelfChangedPlayer {
  id: string;
  name: string;
}

export interface SessionEndRequest {
  teamId: string;
}

export interface SessionExtendRequest {
  teamId: string;
  sessionEnd: Date;
}

export interface PlayerEnlistment {
  playerId: string;
  userId: string;
  code: string;
}

export interface Standing {
  teamId: string;
  approvedName: string;
  sessionBegin: Date;
  sessionEnd: Date;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  session: TimeWindow;
  advanced: boolean;
  sponsor: Sponsor;
  teamSponsors: Sponsor[];
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
  approvedName: string;
  sessionBegin: Date;
  sessionEnd: Date;
  rank: number;
  score: number;
  time: number;
  correctCount: number;
  partialCount: number;
  challenges: TeamChallenge[];
  members: TeamMember[];
  sponsors: SimpleEntity[];
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
  userId: string;
}

export interface TeamPlayer {
  id: string;
  teamId: string;
  userName: string;
  userApprovedName: string;
  name: string;
  nameStatus: string;
  approvedName: string;
  sponsor: Sponsor;
  role: PlayerRole;
  isManager: boolean;
  pendingName: string;
}

export interface TeamState {
  id: string;
  name: string;
  sessionBegin: Date,
  sessionEnd: Date,
  actor: SimpleEntity
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
  sponsors: SimpleEntity[];
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
  publishedOn?: Date;
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
