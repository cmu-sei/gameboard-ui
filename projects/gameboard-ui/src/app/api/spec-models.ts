// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SimpleEntity } from "./models";

export interface ExternalSpec {
  externalId: string;
  name: string;
  description: string;
  gameEngineType: GameEngineType;
  solutionGuideUrl: string;
  showSolutionGuideInCompetitiveMode: boolean;
}

export interface SpecDetail extends ExternalSpec {
  tag: string;
  averageDeploySeconds: number;
  points: number;
  disabled: boolean;
  isHidden: boolean;
  x: number;
  y: number;
  r: number;
  c: string;

}

export interface GameChallengeSpecs {
  game: SimpleEntity;
  challengeSpecs: SimpleEntity[];
}

export interface Spec extends SpecDetail {
  id: string;
  gameId: string;
}

export interface NewSpec extends SpecDetail {
  gameId: string;
}

export interface ChangedSpec extends SpecDetail {
  id: string;
}

export interface SpecSummary {
  id: string;
  name: string;
  description: string;
  text: string;
  gameId: string;
  gameName: string;
  gameLogo: string;
  averageDeploySeconds: number;
  solutionGuideUrl: string;
  tags?: string[];
}

export enum GameEngineType {
  topomojo = 'topomojo',
  crucible = 'crucible',
}

export interface AddSolveSpeedChallengeBonus {
  description: string;
  pointValue: number;
  rank: number;
}

export interface ChallengeSpecBonusViewModel {
  id: string;
  description: string;
  pointValue: number;
  parameters: { [key: string]: any };
}

export enum ChallengeBonusType {
  SolveSpeed = 0
}

export interface GetChallengeSpecQuestionPerformanceResult {
  challengeSpec: SimpleEntity;
  game: SimpleEntity;
  questions: ChallengeSpecQuestionPerformance[];
}

export interface ChallengeSpecQuestionPerformance {
  questionRank: number;
  hint: string;
  prompt: string;
  pointValue: number;

  countCorrect: number;
  countSubmitted: number;
}
