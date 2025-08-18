import { DateTime } from "luxon";
import { GameCardContext } from "@/api/game-models";
import { PagedArray, Search, SimpleEntity, TimestampRange } from "@/api/models";

export interface ChallengesAddToGroupRequest {
    addByGameId?: string;
    addByGameDivision?: string;
    addByGameSeason?: string;
    addByGameSeries?: string;
    addByGameTrack?: string;
    addBySpecIds?: string[];
    addByTag?: string;
}

export interface ChallengesAddToGroupResponse {
    addedChallengeSpecIds: string[];
}

export interface ChallengeTagsListResponse {
    challengeTags: ChallengeTagsListResponseTag[];
}

export interface ChallengeTagsListResponseTag {
    tag: string;
    challengeCount: number;
}

export interface CreatePracticeChallengeGroupRequest {
    name: string;
    description: string;
    image?: File;
    isFeatured: boolean;
    parentGroupId?: string;
}

export interface GetPracticeChallengeGroupResponse {
    group: PracticeChallengeGroupDto;
}

export interface PracticeChallengeGroupDto {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    isFeatured: boolean;
    challengeCount: number;
    challengeMaxScoreTotal: number;
    challenges: PracticeChallengeGroupDtoChallenge[];
    tags: string[];
    parentGroup?: SimpleEntity;
    childGroups: SimpleEntity[];
}

export interface PracticeChallengeGroupDtoChallenge {
    id: string;
    name: string;
    game: SimpleEntity;
    description: string;
    tags: string[];
    launchData: PracticeChallengeGroupDtoChallengeLaunchData;
    maxPossibleScore: number;
}

export interface PracticeChallengeGroupDtoChallengeLaunchData {
    countCompletions: number;
    countLaunches: number;
    lastLaunch: DateTime;
}

export interface ListChallengesRequest {
    searchTerm?: string;
}

export interface UpdateChallengeGroupRequest {
    id: string;
    name: string;
    description: string;
    image?: File;
    isFeatured: boolean;
    parentGroupId?: string;
}

export interface SearchPracticeChallengesRequest {
    filter: Search;
    userProgress?: SearchPracticeChallengesRequestUserProgress;
}

export type SearchPracticeChallengesRequestUserProgress = "notAttempted" | "attempted" | "completed";

export interface SearchPracticeChallengesResult {
    results: PagedArray<PracticeChallengeView>;
}

export interface SearchGamesResult {
    results: PagedArray<GameCardContext>;
}

export interface PracticeModeSettings {
    attemptLimit?: number;
    certificateTemplateId?: string;
    defaultPracticeSessionLengthMinutes: number;
    introTextMarkdown: string;
    maxConcurrentPracticeSessions: number | null;
    maxPracticeSessionLengthMinutes: number | null;
    suggestedSearches: string[];
}

export interface PracticeSession {
    gameId: string;
    playerId: string;
    session: TimestampRange;
    teamId: string;
    userId: string;
}

export interface PracticeChallengeView {
    id: string;
    name: string;
    description: string;
    text: string;
    averageDeploySeconds: number;
    isHidden: boolean;
    feedbackTemplateId: string;
    solutionGuideUrl: string;
    scoreMaxPossible: number;
    tags: string[];
    game: {
        id: string;
        name: string;
        logo: string;
        isHidden: string;
    },
    userBestAttempt?: UserPracticeHistoryChallenge;
}

export interface UserPracticeHistoryChallenge {
    challengeId: string;
    challengeSpecId: string;
    challengeName: string;
    attemptCount: number;
    bestAttemptDate?: DateTime;
    bestAttemptScore?: number;
    isComplete: boolean;
}

export interface UserPracticeSummary {
    countAttempted: number;
    countAvailable: number;
    countCompleted: number;
    pointsAvailable: number;
    pointsScored: number;
    tagsPlayed: UserPracticeSummaryTagEngagement[];
    tagsUnplayed: string[];
}

export interface UserPracticeSummaryTagEngagement {
    tag: string;
    countAttempted: number;
    countAvailable: number;
    countCompleted: number;
    pointsAvailable: number;
    pointsScored: number;
}
