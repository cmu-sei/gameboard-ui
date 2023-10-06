// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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
  x: number;
  y: number;
  r: number;
  c: string;
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
}

export enum GameEngineType {
  topomojo = 'topomojo',
  crucible = 'crucible',
}
