import { SimpleEntity } from "@/api/models";
import { PlayerMode } from "@/api/player-models";
import { DateTime, Duration } from "luxon";

export interface CertificateTemplateView {
    id?: string;
    name: string;
    content: string;
    createdByUser: SimpleEntity;
    useAsPracticeTemplateForGames: SimpleEntity[];
    useAsTemplateForGames: SimpleEntity[];
}

export interface CompetitiveModeCertificate {
    playerName: string;
    teamName: string;
    userName: string;
    duration: Duration;
    game: CertificateGameView;
    date: DateTime;
    rank?: number;
    score: number;
    uniquePlayerCount: number;
    uniqueTeamCount: number;
}

export interface PracticeModeCertificate {
    challenge: {
        id: string;
        name: string;
        description: string;
        challengeSpecId: string;
    };
    date: Date;
    game: CertificateGameView;
    ownerUser: SimpleEntity;
    playerName: string;
    publishedOn?: Date;
    score: number;
    time: Duration;
}

export interface CertificateGameView {
    id: string;
    name: string;
    season: string;
    track: string;
    division: string;
    series: string;
    isTeamGame: boolean;
    maxPossibleScore: number;
}

export interface PublishedCertificateViewModel {
    id?: string;
    publishedOn?: Date;
    awardedForEntity: SimpleEntity;
    mode: PlayerMode;
}

export interface UpsertCertificateTemplate {
    id?: string | null;
    name: string;
    content: string;
}
