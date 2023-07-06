export interface SignalRHubEventHandler<TData> {
    eventType: string,
    handler: (data: TData) => any;
}

export interface SignalRHubEventType { }
