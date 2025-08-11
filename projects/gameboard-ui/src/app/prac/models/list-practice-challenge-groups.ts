import { SimpleEntity } from "@/api/models";

export interface ListPracticeChallengeGroupsRequest {
    getRootOnly?: boolean;
    parentGroupId?: string;
    searchTerm?: string;
}

export interface ListPracticeChallengeGroupsResponse {
    groups: ListPracticeChallengeGroupsResponseGroup[];
}

export interface ListPracticeChallengeGroupsResponseGroup {
    id: string;
    name: string;
    challengeCount: number;
    challengeMaxScoreTotal: number;
    description: string;
    imageUrl?: string;
    isFeatured: boolean;
    tags: string[];
    parentGroup?: SimpleEntity;
    childGroups: SimpleEntity[];
    challenges: ListPracticeChallengeGroupsResponseChallenge[];
}

export interface ListPracticeChallengeGroupsResponseChallenge {
    id: string;
    name: string;
    description: string;
    tags: string[];
    maxPossibleScore: number;
}

