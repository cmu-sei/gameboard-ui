import { DateTime } from "luxon";
import { GameCardContext } from "@/api/game-models";
import { PagedArray, Search, SimpleEntity, TimestampRange } from "@/api/models";

export interface ChallengesAddToGroupRequest {
    addBySpecIds?: string[];
    addByGameId?: string;
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
    group: GetPracticeChallengeGroupResponseGroup;
    parentGroup?: SimpleEntity;
    childGroups: GetPracticeChallengeGroupResponseGroup[];
}

export interface GetPracticeChallengeGroupResponseChallenge {
    id: string;
    name: string;
    game: SimpleEntity;
    countCompleted: number;
    countLaunched: number;
    lastLaunched?: DateTime;
}

export interface GetPracticeChallengeGroupResponseGroup {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    isFeatured: boolean;
    challenges: GetPracticeChallengeGroupResponseChallenge[];
}

export interface GetUserChallengeGroupsRequest {
    groupId?: string;
    parentGroupId?: string;
    searchTerm?: string;
    userId?: string;
}

export interface GetUserChallengeGroupsResponse {
    groups: GetUserChallengeGroupsResponseGroup[];
}

export interface GetUserChallengeGroupsResponseGroup {
    id: string;
    name: string;
    description: string;
    challengeCount: number;
    challengePoints: number;
    imageUrl?: string;
    isFeatured: boolean;
    tags: string[];
    challenges: GetUserChallengeGroupsResponseChallenge[];
    childGroups: SimpleEntity[];
    parentGroup?: SimpleEntity;
}

export interface GetUserChallengeGroupsResponseChallenge {
    id: string;
    name: string;
    description: string;
    hasCertificateTemplate: boolean;
    maxPossibleScore: number;
    tags: string[];
    bestAttempt?: GetUserChallengeGroupsResponseChallengeAttempt;
}

export interface GetUserChallengeGroupsResponseChallengeAttempt {
    certificateAwarded: boolean;
    date: DateTime;
    score: number;
}

export interface PracticeChallengeGroupDto {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    isFeatured: boolean;
    parentGroupId?: string;
}

export interface ListChallengesRequest {
    searchTerm?: string;
}

export interface ListChallengeGroupsResponse {
    groups: ListChallengeGroupsResponseGroup[];
}

export interface ListChallengeGroupsResponseGroup {
    id: string;
    name: string;
    description: string;
    challengeCount: number;
    imageUrl?: string;
    isFeatured: boolean;
    parentGroupId?: string;
    childGroups: ListChallengeGroupsResponseGroup[]
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
