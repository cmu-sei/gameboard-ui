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
    key: string;
}
