// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { emit } from "process";

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
  radioQuestions?: FeedbackQuestion[];
  textQuestions?: FeedbackQuestion[];
  submitted?: boolean;
  timestamp?: Date;
  approvedName?: string;
  challengeTag?: string;
}

export interface FeedbackSubmission {
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
  options: string[];
  required?: boolean;
}

export interface FeedbackTemplate {
  board: FeedbackQuestion[];
  challenge: FeedbackQuestion[];
}

export interface FeedbackSearchParams {
  gameId?: string;
  challengeSpecId?: string;
  type?: string;
}

export enum QuestionType {
  radio = 'radio',
  text = 'text'
}


