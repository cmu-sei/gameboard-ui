// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DateTime } from "luxon";
import { FeedbackTemplate } from "./feedback-models";
import { SimpleEntity } from "./models";
import { Player, PlayerMode, TimeWindow } from "./player-models";
import { ApiUser } from "./user-models";

export interface GameDetail {
  name: string;
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
  certificateTemplateId?: string;
  practiceCertificateTemplateId?: string;
  externalHostId?: string;
  feedbackTemplate?: FeedbackTemplate;
  challengesFeedbackTemplateId?: string;
  feedbackTemplateId?: string;
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
  sessionAvailabilityWarningThreshold?: number;
  gamespaceLimitPerSession: number;
  isPublished: boolean;
  requireSponsoredTeam: boolean;
  requireSynchronizedStart: boolean;
  requireTeam: boolean;
  showOnHomePageInPracticeMode: boolean;
  allowLateStart: boolean;
  allowPreview: boolean;
  allowPublicScoreboardAccess: boolean;
  allowTeam: boolean;
  allowReset: boolean;
  playerMode: PlayerMode;
  registrationActive: boolean;
  session: TimeWindow;
  registration: TimeWindow;
  cardText1: string;
  cardText2: string;
  cardText3: string;
  isFeatured: boolean;
  isLive: boolean;
  hasEnded: boolean;
  countPlayers: number;
  countTeams: number;
}

export interface GameCardContext {
  id: string;
  name: string;
  engineMode: "vm" | "cubespace" | "external";
  liveSessionCount: number;
  logo: string;
  isPractice: boolean;
  isPublished: boolean;
  isTeamGame: boolean;
}

export interface Game extends GameDetail {
  id: string;
  mapUrl: string;
  modeUrl: string;
  isPracticeMode: boolean;
  isTeamGame: boolean;
}

export interface NewGame extends GameDetail {
  isClone?: boolean;
}

export type ChangedGame = Game

export enum GameEngineMode {
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

export enum GamePlayState {
  NotStarted = "notStarted",
  Deploying = "deploying",
  Starting = "starting",
  Started = "started",
  GameOver = "gameOver"
}

export type ExternalGameDeployStatus = "notStarted" | "partiallyDeployed" | "deploying" | "deployed";

export interface ExternalGameHostClientInfo {
  id: string;
  name: string;
  clientUrl: string;
}

export interface ExternalGameHost {
  id: string;
  name: string;
  clientUrl: string;
  destroyResourcesOnDeployFailure?: boolean;
  gamespaceDeployBatchSize?: number;
  hasApiKey: boolean;
  hostUrl: string;
  pingEndpoint?: string;
  startupEndpoint: string;
  teamExtendedEndpoint?: string;
  usedByGames: SimpleEntity[];
}

export interface UpsertExternalGameHost {
  id?: string;
  name: string;
  clientUrl: string;
  hostUrl: string;
  startupEndpoint: string;
  destroyResourcesOnDeployFailure?: boolean;
  gamespaceDeployBatchSize?: number;
  hostApiKey?: string;
  pingEndpoint?: string;
  teamExtendedEndpoint?: string;
}

export interface GameSessionAvailibilityResponse {
  nextSessionEnd?: DateTime
  sessionsAvailable: number
}


export interface GetExternalTeamDataResponse {
  teamId: string;
  externalUrl: string;
  deployStatus: ExternalGameDeployStatus;
}
