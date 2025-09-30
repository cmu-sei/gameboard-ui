// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface NewApiKey {
    userId: string;
    expiresOn?: Date;
    name: string;
}

export interface ApiKeyViewModel {
    id: string;
    name: string;
    generatedOn: Date;
    expiresOn?: Date;
    ownerId: string;
}

export interface ApiKeyViewModelWithPlainKey extends ApiKeyViewModel {
    plainKey: string;
}
