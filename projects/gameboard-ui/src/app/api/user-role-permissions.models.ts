import { UserRoleKey } from "./user-models";

export type UserRolePermissionKey =
    "Admin_View" |
    "ApiKeys_CreateRevoke" |
    "Games_CreateEditDelete" |
    "Games_DeleteWithPlayerData" |
    "Games_ViewUnpublished" |
    "Play_ChooseChallengeVariant" |
    "Play_IgnoreSessionResetSettings" |
    "Play_IgnoreExecutionWindow" |
    "Practice_EditSettings" |
    "Reports_View" |
    "Scores_AwardManualBonuses" |
    "Scores_RegradeAndRerank" |
    "Scores_ViewLive" |
    "Sponsors_CreateEdit" |
    "Support_EditSettings" |
    "Support_ManageTickets" |
    "Support_ViewTickets" |
    "SystemNotifications_CreateEdit" |
    "Teams_ApproveNameChanges" |
    "Teams_CreateEditDeleteChallenges" |
    "Teams_DeployGameResources" |
    "Teams_EditSession" |
    "Teams_Enroll" |
    "Teams_Observe" |
    "Teams_SendAnnouncements" |
    "Teams_SetSyncStartReady" |
    "Users_CreateEditDelete" |
    "Users_EditRoles"

export interface UserRolePermissionsCategory {
    name: string;
    permissions: UserRolePermission[];
}

export interface UserRolePermission {
    group: string;
    key: UserRolePermissionKey;
    name: string;
    description: string;
}

export interface UserRole {
    description: string;
    permissions: UserRolePermissionKey[];
}

export interface UserRolePermissionsOverviewResponse {
    categories: UserRolePermissionsCategory[];
    roles: { [key: string]: UserRole };
    yourRole: UserRoleKey;
}
