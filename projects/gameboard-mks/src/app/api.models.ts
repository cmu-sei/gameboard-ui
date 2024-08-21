// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface ConsoleActionResponse {
  message?: string;
}

export interface ConsoleRequest {
  name?: string;                      // The name of the VM (v=abc)
  sessionId?: string;                 // The hexadecimal string of the Gamespace ID (s=7cd...)
  action?: string;                    // 
  fullbleed?: boolean;                // Whether this window covers the whole page (f=0 or f=1)
  observer?: boolean;                 // Whether this challenge is being observed (o=0 or o=1)
  userId?: string;                    // The hexadecimal ID of the user trying to access the VM (u=e3c...)
  enableActivityListener: boolean;    // Indicates whether the user activity listener should be enabled. Only works for practice consoles.
  challengeName?: string;             // the name of the challenge which owns the console
  teamName?: string;                  // the name of the player/team using the console
}

export interface ConsolePresence {
  name?: string;
  sessionId?: string;
  username?: string;
}

export interface ConsoleSummary {
  id: string;
  sessionId: string;
  name: string;
  url: string;
  isRunning?: boolean;
  isObserver?: boolean;
  ticket: string;
  error?: string;
}

export interface ConsoleActor {
  userId: string;
  userName: string;
  playerName: string;
  challengeName: string;
  challengeId: string;
  gameId: string;
  vmName: string;
  timestamp: Date;
}

export interface VmOperation {
  id: string;
  op: string;
}

export interface VmOptions {
  iso: Array<string>;
  net: Array<string>;
}

export interface VmQuestion {
  id?: string;
  prompt?: string;
  defaultChoice?: string;
  choices?: Array<VmQuestionChoice>;
}

export interface VmTask {
  id?: string;
  name?: string;
  progress?: number;
  whenCreated?: string;
}

export interface VmQuestionChoice {
  key?: string;
  label?: string;
}

export interface KeyValuePair {
  key?: string;
  value?: string;
}

export interface VmAnswer {
  questionId?: string;
  choiceKey?: string;
}

export enum VmStateEnum {
  off = 'off',
  running = 'running',
  suspended = 'suspended'
}

export enum VmOperationTypeEnum {
  start = 'start',
  stop = 'stop',
  save = 'save',
  revert = 'revert',
  delete = 'delete'
}
