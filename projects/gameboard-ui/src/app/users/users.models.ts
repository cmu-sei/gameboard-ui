import { Duration } from "luxon";
import { SimpleEntity } from "@/api/models";
import { PlayerMode } from "@/api/player-models";

export interface PracticeModeCertificate {
    challenge: {
        id: string;
        name: string;
        description: string;
        challengeSpecId: string;
    };
    date: Date;
    game: {
        id: string;
        name: string;
        season: string;
        track: string;
        division: string;
    }
    ownerUser: SimpleEntity;
    playerName: string;
    publishedOn?: Date;
    score: number;
    time: Duration;
}

export interface PublishedCertificateViewModel {
    id?: string;
    publishedOn?: Date;
    awardedForEntity: SimpleEntity;
    ownerUser: SimpleEntity;
    mode: PlayerMode;
}

export interface UserAppSettings {
    useStickyChallengePanel: boolean;
}
