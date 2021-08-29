// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface ApiUser {
  id: string;
  name: string;
  approvedName: string;
  sponsor: string;
  role: UserRole;
  // enrollments: Player[];
  isAdmin: boolean;
  isDirector: boolean;
  isRegistrar: boolean;
  isDesigner: boolean;
  isTester: boolean;
  isObserver: boolean;
  sponsorLogo: string;
}

export interface NewUser {
  id: string;
  sub: string;
  name: string;
  username: string;
  email: string;
}

export interface ChangedUser {
  id: string;
  name: string;
  approvedName: string;
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

export enum UserRole {
  member = 'member',
  observer = 'observer',
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
