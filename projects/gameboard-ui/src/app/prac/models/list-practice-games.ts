export interface ListPracticeGamesResponse {
    games: ListPracticeGamesResponseGame[];
}

export interface ListPracticeGamesResponseGame {
    id: string;
    name: string;
    challengeCount: number;
}
