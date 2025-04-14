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
}
