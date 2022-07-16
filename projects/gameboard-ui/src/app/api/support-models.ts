// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { SafeResourceUrl } from "@angular/platform-browser";
import { Challenge, ChallengeOverview, ChallengeSummary } from "./board-models";
import { Player, PlayerOverview } from "./player-models";
import { UserSummary } from "./user-models";

export interface Ticket {
  id: string;
  key: string;
  fullKey: string;
  requesterId: string;
  assigneeId: string;
  creatorId: string;
  challengeId: string;
  playerId: string;
  teamId: string;
  summary: string;
  description: string;
  status: string;
  label: string;
  selfCreated: boolean;
  staffCreated: boolean;

  created: Date;
  lastUpdated: Date;
  canUpdate: boolean;

  attachments: string[];
  attachmentFiles: AttachmentFile[]
    
  requester?: UserSummary;
  assignee?: UserSummary;
  creator?: UserSummary;
  challenge?: ChallengeOverview;
  player?: PlayerOverview;

  activity: TicketActivity[];
}

export interface TicketSummary {
  id: string;
  key: string;
  fullKey: string;
  requesterId: string;
  assigneeId: string;
  creatorId: string;
  challengeId: string;
  teamId: string;
  summary: string;
  description: string;
  status: string;
  label: string;
  labelsList: string[];

  selfCreated: boolean;
  staffCreated: boolean;

  created: Date;
  lastUpdated: Date;
    
  requester?: UserSummary;
  assignee?: UserSummary;
  creator?: UserSummary;
  challenge?: ChallengeSummary;

}

export interface SelfNewTicket {
  challengeId: string;
  summary: string;
  description: string;
}

export interface NewTicket {
  requesterId: string;
  assigneeId: string;
  challengeId: string;
  challenge: Challenge;
  teamId: string;
  summary: string;
  description: string;
  status: string;
  label: string;
  uploads: File[];

  requester?: UserSummary; // for form display only
}

export interface SelfChangedTicket {
  id: string;
  challengeId: string;
  summary: string;
  description: string;
}

export interface ChangedTicket {
  requesterId: string;
  assigneeId: string;
  challengeId: string;
  teamId: string;
  summary: string;
  description: string;
  status: string;
  label: string;
  id: string;
}

export interface NewTicketComment {
  ticketId: string;
  message: string;
  uploads: File[];
}

export interface TicketActivity {
  id: string;
  message: string;
  status: string;
  assigneeId: string;
  type: ActivityType;
  timestamp: Date;

  attachments: string[];
  attachmentFiles: AttachmentFile[]

  user: UserSummary;
  assignee: UserSummary;
}

export interface TicketDayGroup {
  date: string;
  dayOfWeek: string;
  count: number;
  shift1Count: number;
  shift2Count: number;
  outsideShiftCount: number;
}

export interface TicketLabelGroup {
  label: string;
  count: number;
}

export interface TicketChallengeGroup {
  challengeSpecId: string;
  challengeTag: string;
  challengeName: string;
  count: number;
}

export enum ActivityType
{
    comment = 0,
    statusChange,
    assigneeChange,
}

export interface AttachmentFile {
  filename: string;
  extension: string;

  // Not SafeResourceUrl so it can be retrieved in a function
  fullPath: string
  showPreview: boolean;
}

export interface LabelSuggestion {
  name: string;
  custom?: boolean;
}


