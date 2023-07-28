// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { FeedbackTemplate } from "./feedback-models";
import { Player, PlayerMode, TimeWindow } from "./player-models";
import { ApiUser } from "./user-models";

export interface GameDetail {
  name: string;
  key: string;
  competition: string;
  track: string;
  season: string;
  division: string;
  mode: GameEngineMode;
  logo: string;
  sponsor: string;
  background: string;
  testCode: string;
  gameStart: Date;
  gameEnd: Date;
  gameMarkdown: string;
  feedbackConfig: string;
  certificateTemplate: string;
  feedbackTemplate: FeedbackTemplate;
  registrationMarkdown: string;
  registrationOpen: Date;
  registrationClose: Date;
  registrationType: GameRegistrationType;
  registrationConstraint: string;
  maxAttempts: number;
  minTeamSize: number;
  maxTeamSize: number;
  sessionMinutes: number;
  sessionLimit: number;
  gamespaceLimitPerSession: number;
  isPublished: boolean;
  requireSponsoredTeam: boolean;
  allowPreview: boolean;
  externalGameClientUrl?: string;
  externalGameStartupUrl?: string;
  requireSynchronizedStart: boolean;
  requireTeam: boolean;
  allowTeam: boolean;
  allowReset: boolean;
  playerMode: PlayerMode;
  registrationActive: boolean;
  session: TimeWindow;
  registration: TimeWindow;
  cardText1: string;
  cardText2: string;
  cardText3: string;
  isLive: boolean;
  hasEnded: boolean;
}

export interface Game extends GameDetail {
  id: string;
  mapUrl: string;
  cardUrl: string;
  modeUrl: string;
  isPracticeMode: boolean;
}

export interface NewGame extends GameDetail {
  isClone?: boolean;
}

export type ChangedGame = Game

export enum GameEngineMode {
  Cubespace = "unity",
  External = "external",
  Standard = "vm"
}

export enum GameRegistrationType {
  none = 'none',
  open = 'open',
  domain = 'domain'
}

export interface GameGroup {
  year: number;
  month: number;
  monthName: string;
  games: Game[];
}

export interface UploadedFile {
  filename: string;
}

export interface SessionForecast {
  time: Date;
  available: number;
  reserved: number;
  text: string;
  percent: number;
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

export enum GameStartPhase {
  NotStarted,
  Starting,
  Started,
  GameOver
}
