export interface ApiTimeWindow {
    now: Date;
    start: Date;
    end: Date;
    durationMs?: number;
    msTilStart?: number;
    msTilEnd?: number;
    state: ApiTimeWindowState;
}

export enum ApiTimeWindowState {
    Before,
    During,
    After
}
