export interface UnityDeployContext {
    sessionExpirationTime: Date;
    gameId: string;
    playerId: string;
    teamId: string;
}

export interface UnityUndeployContext {
    gameId: string;
    teamId: string;
}

export interface UnityActiveGame {
    gamespaceId: string;
    headlessUrl: string;
    vms: UnityGameVM[];
    gameId: string;
    playerId: string;
    teamId: string;
    maxPoints: number;
    sessionExpirationTime: Date;
}

export interface UnityDeployResult {
    gamespaceId: string;
    headlessUrl: string;
    vms: UnityGameVM[];
    totalPoints: number;
}

export interface UnityGameVM {
    Id: string;
    Url: string;
    Name: string;
}

export interface GamebrainActiveGame {
    gamespaceId: string;
    headlessUrl: string;
    vms: UnityGameVM[];
    totalPoints: number;
}

export interface NewUnityChallenge {
    gameId: string,
    playerId: string,
    teamId: string,
    maxPoints: number,
    gamespaceId: string,
    vms: UnityGameVM[];
}