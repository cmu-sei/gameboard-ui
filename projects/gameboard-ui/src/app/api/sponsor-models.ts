// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface Sponsor {
    id: string;
    name: string;
    logo: string;
    parentSponsorId?: string;
}

export interface SponsorWithParent extends Sponsor {
    parentSponsor: Sponsor;
}

export interface SponsorWithChildSponsors extends Sponsor {
    childSponsors: Sponsor[];
}

export interface ChangedSponsor {
    id: string;
    name?: string;
    logo?: string;
    parentSponsorId?: string;
}

export interface UpsertSponsor {
    id?: string;
    name: string;
    logoFile?: File;
    parentSponsorId?: string;
}

export interface NewSponsor {
    name: string;
    logoFile?: File;
    parentSponsorId?: string;
}

