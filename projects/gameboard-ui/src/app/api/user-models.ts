// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface ApiUser {
  id: string;
  name: string;
  nameStatus: string;
  approvedName: string;
  sponsor: string;
  role: UserRole;
  createdOn: Date;
  lastLoginDate?: Date;
  loginCount: number;
  isAdmin: boolean;
  isDirector: boolean;
  isRegistrar: boolean;
  isDesigner: boolean;
  isTester: boolean;
  isObserver: boolean;
  isSupport: boolean;
  sponsorLogo: string;
  pendingName: string;
  roleTag: string;
}

export interface NewUser {
  id: string;
}

export interface ChangedUser {
  id: string;
  name: string;
  approvedName: string;
  nameStatus: string;
  sponsor: string;
  role: UserRole;
}

export interface SelfChangedUser {
  id: string;
  name: string;
  sponsor: string;
}

export interface TeamMember {
  id: string;
  approvedName: string;
  role: PlayerRole;
}

export interface UserSummary {
  id: string;
  approvedName: string;
}

export enum UserRole {
  member = 'member',
  observer = 'observer',
  support = 'support',
  tester = 'tester',
  designer = 'designer',
  registrar = 'registrar',
  director = 'director',
  admin = 'admin'
}

export enum PlayerRole {
  member = 'member',
  manager = 'manager'
}

export interface TreeNode {
  name: string;
  path: string;
  folders: TreeNode[];
  files: string[];
}

export interface Announcement {
  teamId?: string;
  message: string;
}

export interface TryCreateUserResult {
  isNewUser: boolean;
  user: ApiUser;
}

// just use this for convenience during the authentication process (see the utiltiy user service).
// There are other properties in the profile that may be useful, but just mapping the key ones right now
export interface UserOidcProfile {
  access_token: string;
  id_token: string;
  expiresAt: number;
  scope: string;
  sub: string;
}
