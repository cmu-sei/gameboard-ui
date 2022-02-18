// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { FeedbackTemplate } from "./feedback-models";
import { TimeWindow } from "./player-models";

export interface GameDetail {
  name: string;
  key: string;
  competition: string;
  track: string;
  season: string;
  division: string;
  mode: string;
  logo: string;
  sponsor: string;
  background: string;
  testCode: string;
  gameStart: Date;
  gameEnd: Date;
  gameMarkdown: string;
  feedbackConfig: string;
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
  requireSession: boolean;
  requireTeam: boolean;
  allowTeam: boolean;
  allowReset: boolean;
  registrationActive: boolean;
  session: TimeWindow;
  registration: TimeWindow;
  cardText1: string;
  cardText2: string;
  cardText3: string;
}

export interface Game extends GameDetail
{
  id: string;

  mapUrl: string;
  cardUrl: string;
  modeUrl: string;
}

export interface NewGame extends GameDetail {
}

export interface ChangedGame extends Game {
}

export enum GameRegistrationType {
  none = 'none',
  open = 'open',
  domain = 'domain'
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
