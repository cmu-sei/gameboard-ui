// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface UserReport {
  title: string;
  timestamp: Date;
  enrolledUserCount: number;
  unenrolledUserCount: number;
}

export interface PlayerReport {
  title: string;
  timestamp: Date;
  stats: PlayerStat[];
}

export interface PlayerStat {
  gameId: string;
  gameName: string;
  playerCount: number;
  sessionPlayerCount: number;
}

export interface SponsorReport {
  title: string;
  timestamp: Date;
  stats: SponsorStat[];
}

export interface SponsorStat {
  id: string;
  name: string;
  logo: string;
  count: number;
  teamCount: number;
}

export interface GameSponsorReport {
  title: string;
  timestamp: Date;
  stats: GameSponsorStat[];
}

export interface GameSponsorStat {
  gameId: string;
  gameName: string;
  stats: SponsorStat[];
}

export interface ChallengeReport {
  title: string;
  timestamp: Date;
  stats: ChallengeStat[];
}

export interface ChallengeStat {
  id: string;
  name: string;
  tag: string;
  points: number;
  successCount: number;
  partialCount: number;
  averageTime: string;
  attemptCount: number;
  averageScore: number;
}

export interface ChallengeDetailReport {
  challengeId: string;
  parts: Part[];
  attemptCount: number;
}

export interface ChallengeDetailReportView extends ChallengeDetailReport {
  visible: boolean;
}

export interface Part {
  text: string;
  solveCount: number;
  weight: number;
}

export interface TicketDetailReport {
  key: string;
  timestamp: Date;
  details: TicketDetail[];
}

export interface TicketDetail {
  key: number;
  summary: string;
  description: string;
  challenge: string;
  gameSession: string;
  team: string;
  assignee: string;
  requester: string;
  creator: string;
  created: Date;
  lastUpdated: Date;
  label: string;
  status: string;
}

export interface ParticipationReport {
  key: string;
  timestamp: Date;
  stats: ParticipationStat[];
}

export interface ParticipationStat {
  key: string;
  gameCount: number;
  playerCount: number;
  sessionPlayerCount: number;
  teamCount: number;
  sessionTeamCount: number;
  challengesDeployedCount: number;
}

export interface CorrelationReport {
  key: string;
  timestamp: Date;
  stats: CorrelationStat[];
}

export interface CorrelationStat {
  gameCount: number;
  userCount: number;
}
