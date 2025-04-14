export interface ConsoleState {
    id: string;
    sessionId: string;
    name: string;
    url: string;
    isRunning?: boolean;
    isObserver?: boolean;
    ticket: string;
    error?: string;
}
