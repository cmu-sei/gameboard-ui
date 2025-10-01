// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { DateTime } from "luxon";
import { GameEngineType } from "./spec-models";
import { GameEngineMode, GameRegistrationType } from "./game-models";
import { PlayerMode } from "./player-models";
import { SimpleEntity } from "./models";

export interface GameExportBatch {
    id: string;
    exportedBy: SimpleEntity;
    exportedOn: DateTime;
    gameCount: number;
    packageDownloadUrl: string;
}

export interface ListGameExportBatchesResponse {
    exportBatches: GameExportBatch[];
}

export interface GameImportExportBatch {
    exportBatchId: string;
    downloadUrl: string;
    games: GameImportExportGame[];
    practiceAreaCertificateTemplateId: string;
    certificateTemplates: { [id: string]: GameImportExportCertificateTemplate };
    externalHosts: { [id: string]: GameImportExportExternalHost };
    feedbackTemplates: { [id: string]: GameImportExportFeedbackTemplate };
    sponsors: { [id: string]: GameImportExportSponsor };
}

export interface GameImportExportGame {
    id: string;
    name: string;
    competition: string;
    season: string;
    track: string;
    division: string;
    cardImageFileName: string;
    sponsorId: string;
    gameStart?: DateTime;
    gameEnd?: DateTime;
    gameMarkdown: string;
    registrationOpen?: DateTime;
    registrationClose?: DateTime;
    registrationType: GameRegistrationType;
    minTeamSize: number;
    maxTeamSize: number;
    maxAttempts?: number;
    requireSponsoredTeam: boolean;
    sessionMinutes: number;
    sessionLimit?: number;
    sessionAvailabilityWarningThreshold?: number;
    gamespaceLimitPerSession: number;
    isPublished: boolean;
    allowLateStart: boolean;
    allowPreview: boolean;
    allowPublicScoreboardAccess: boolean;
    allowReset: boolean;
    cardText1: string;
    cardText2: string;
    cardText3: string;
    isFeatured: boolean;
    mapImageFileName: string;
    mode: GameEngineMode;
    playerMode: PlayerMode;
    requiresSynchronizedStart: boolean;
    showOnHomePageInPracticeMode: boolean;
    certificateTemplateId: string;
    challengesFeedbackTemplateId: string;
    specs: GameImportExportChallengeSpec[];
    externalHostId: string;
    feedbackTemplateId: string;
    practiceCertificateTemplateId: string;
}

export interface GameImportExportChallengeSpec {
    description: string;
    disabled: boolean;
    externalId: string;
    gameEngineType: GameEngineType;
    isHidden: boolean;
    name: string;
    points: number;
    showSolutionGuideInCompetitiveMode: boolean;
    tag: string;
    tags: string[];
    text: string;
    x: number;
    y: number;
    r: number;
}

export interface GameImportExportExternalHost {
    id: string;
    name: string;
    clientUrl: string;
    destroyResourcesOnDeployFailure: boolean;
    gamespaceDeployBatchSize?: number;
    httpTimeoutInSeconds?: number;
    hostUrl: string;
    pingEndpoint: string;
    startupEndpoint: string;
    teamExtendedEndpoint: string;
}

export interface GameImportExportFeedbackTemplate {
    id: string;
    helpText: string;
    name: string;
    content: string;
}

export interface GameImportExportCertificateTemplate {
    id: string;
    name: string;
    content: string;
}

export interface GameImportExportSponsor {
    id: string;
    name: string;
    logoFileName: string;
    approved: boolean;
    parentSponsor: GameImportExportSponsor;
}

export interface ImportedGame {
    id: string;
    name: string;
}
