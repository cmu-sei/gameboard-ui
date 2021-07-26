// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface Sponsor {
 id: string;
 name: string;
 logo: string;
 approved: boolean;
 logoUrl: string;
}
export interface ChangedSponsor {
 id: string;
 name: string;
 logo: string;
 approved: boolean;
 logoUrl: string;
}
export interface NewSponsor {
 id: string;
 name: string;
}
