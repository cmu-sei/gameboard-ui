// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SimpleEntity } from "./models";

export interface Feedback {
  id?: string;
  userId?: string;
  playerId?: string;
  challengeId?: string;
  challengeSpecId?: string;
  gameId?: string;
  description?: string;
  questions: FeedbackQuestion[];
  submitted?: boolean;
  timestamp?: Date;
}

export interface FeedbackReportDetails {
  id?: string;
  userId?: string;
  playerId?: string;
  challengeId?: string;
  challengeSpecId?: string;
  gameId?: string;
  questions: FeedbackQuestion[];
  submitted?: boolean;
  timestamp?: Date;
  approvedName?: string;
  challengeTag?: string;
}

export interface FeedbackSubmissionOldAndGross {
  challengeId?: string;
  challengeSpecId?: string;
  gameId: string;
  questions: FeedbackQuestion[];
  submit: boolean;
}

export interface FeedbackQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  shortName?: string;
  answer?: string;
  required?: boolean;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  options?: string[];
  display?: string;
  specify?: QuestionSpecify;
}

export interface FeedbackTemplate {
  game: FeedbackQuestion[];
  challenge: FeedbackQuestion[];
  message?: string;
}

export enum QuestionType {
  likert = 'likert',
  text = 'text',
  selectOne = 'selectOne',
  selectMany = 'selectMany'
}

export interface QuestionStats {
  id?: string;
  prompt?: string;
  shortName?: string;
  required?: boolean;
  average?: string;
  scaleMin?: string;
  scaleMax?: string;
  count?: string;
  lowest?: string;
  highest?: string;
}

export interface QuestionSpecify {
  key?: string,
  prompt?: string
}

export interface FeedbackStats {
  gameId: number;
  challengeSpecId: number;
  configuredCount: number;
  likertCount: number;
  textCount: number;
  selectOneCount: number;
  selectManyCount: number;
  requiredCount: number;
  responsesCount: number;
  maxResponseCount: number;
  inProgressCount: number;
  submittedCount: number;
  questionStats: QuestionStats[];
}

export interface FeedbackTemplate {
  id: string;
  content: string;
  createdByUser: SimpleEntity;
  name: string;
}
