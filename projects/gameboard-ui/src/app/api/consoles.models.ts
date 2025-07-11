import { DateTime } from "luxon";
import { SimpleEntity } from "./models";
import { PlayerMode } from "./player-models";

export type ConsoleUserActivityType = "input" | "mouse";

export interface ConsoleActionRequest {
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

export interface ConsoleId {
    challengeId: string;
    name: string;
}

export interface ConsoleState {
    id: ConsoleId;
    accessTicket: string;
    isRunning: boolean;
    url: string;
}

export interface ConsoleUserActivityResponse {
    message?: string;
    sessionAutoExtended: boolean;
    sessionExpiresAt: DateTime;
}

export interface GetConsoleResponse {
    consoleState: ConsoleState;
    expiresAt: DateTime | null;
    isViewOnly: boolean;
}

export interface ListConsolesRequest {
    challengeSpecId?: string;
    gameId?: string;
    teamId?: string;
    playerMode?: PlayerMode;
    searchTerm?: string;
    sortBy?: ListConsolesRequestSort;
}

export type ListConsolesRequestSort = "rank" | "teamName";

export interface ListConsolesResponse {
    consoles: ListConsolesResponseConsole[];
}

export interface ListConsolesResponseConsole {
    consoleId: ConsoleId;
    accessTicket: string;
    activeUsers: SimpleEntity[];
    challenge: ListConsolesResponseChallenge;
    team: ListConsolesResponseTeam;
    url: string;
}

export interface ListConsolesResponseChallenge {
    id: string;
    isPractice: boolean;
    name: string;
    specId: string;
}

export interface ListConsolesResponseTeam {
    id: string;
    name: string;
    rank?: number;
    score?: number;
}
