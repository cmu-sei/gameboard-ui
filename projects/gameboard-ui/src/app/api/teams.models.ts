import { DateTime } from "luxon";
import { PlayerWithSponsor } from "./models";

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

export type TeamSessionResetType = "unenrollAndArchiveChallenges" | "archiveChallenges" | "preserveChallenges";
export interface TeamSessionUpdate {
    id: string;
    sessionEndsAt: number;
}
