import { DateTime } from "luxon";

export interface AdminExtendTeamSessionResponse {
    teams: [
        { id: string, sessionEnd: DateTime }
    ]
}

export interface ResetTeamSessionRequest {
    unenrollTeam: boolean;
}
