import { DateTime } from "luxon";
import { PlayerWithSponsor, SimpleEntity } from "./models";

export interface AdminEnrollTeamRequest {
    gameId: string;
    userIds: string[];
}

export interface AdminEnrollTeamResponse {
    id: string;
    name: string;
    gameId: string;
    players: PlayerWithSponsor;
}

export interface AdminExtendTeamSessionResponse {
    teams: [
        { id: string, sessionEnd: DateTime }
    ]
}

export interface AddToTeamResponse {
    game: SimpleEntity;
    player: SimpleEntity;
    teamId: string;
    user: SimpleEntity;
}

export interface AdvanceTeamsRequest {
    gameId: string;
    includeScores: boolean;
    teamIds: string[];
}

export interface RemoveFromTeamResponse {
    game: SimpleEntity;
    player: SimpleEntity;
    teamId: string;
    user: SimpleEntity;
}


export type TeamSessionResetType = "unenrollAndArchiveChallenges" | "archiveChallenges" | "preserveChallenges";
export interface TeamSessionUpdate {
    id: string;
    sessionEndsAt: number;
}
