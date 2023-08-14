import { TimeWindow } from "@/api/player-models";
import { DateTime } from "luxon";

export interface ApiTimeWindow {
    now: string | number;
    start: string | number | undefined;
    end: string | number | undefined;
    durationMs?: number;
    msTilStart?: number;
    msTilEnd?: number;
    state: ApiTimeWindowState;
}

export class LocalTimeWindow {
    now: DateTime;
    start: DateTime | null;
    end: DateTime | null;
    durationMs: number | null;
    msTilStart: number | null;
    msTilEnd: number | null;
    state: ApiTimeWindowState;

    constructor(apiTimeWindow: ApiTimeWindow) {
        if (!apiTimeWindow.start && !apiTimeWindow.end) {
            throw new Error(`Can't create an API time window lacking both start ${apiTimeWindow.start} and end (${apiTimeWindow.end})`);
        }

        this.now = DateTime.fromMillis(new Date(apiTimeWindow.now).valueOf());
        this.start = apiTimeWindow.start ? DateTime.fromMillis(new Date(apiTimeWindow.start).valueOf()) : null;
        this.end = apiTimeWindow.end ? DateTime.fromMillis(new Date(apiTimeWindow.end).valueOf()) : null;
        this.durationMs = apiTimeWindow.durationMs || null;
        this.msTilStart = apiTimeWindow.msTilStart || null;
        this.msTilEnd = apiTimeWindow.msTilEnd || null;
        this.state = apiTimeWindow.state;
    }

    isBefore() { return this.state == ApiTimeWindowState.Before; }
    isDuring() { return this.state == ApiTimeWindowState.During; }
    isAfter() { return this.state == ApiTimeWindowState.After; }

    public toLegacyTimeWindow(): TimeWindow {
        if (!this.start && !this.end)
            throw new Error(`Can't convert LocalTimeWindow (${this.start} => ${this.end}) to LegacyTimeWindow - start or end is missing.`);

        return new TimeWindow(this.start!.toJSDate(), this.end!.toJSDate());
    }
}

export enum ApiTimeWindowState {
    Before = "before",
    During = "during",
    After = "after"
}
