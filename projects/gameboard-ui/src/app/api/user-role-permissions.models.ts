import { UserRole } from "./user-models";

export type UserRolePermissionKey = "admin_CreateApiKeys"
    | "admin_CreateEditSponsors"
    | "admin_View"
    | "games_AdminExternal"
    | "games_CreateEditDelete"
    | "games_ViewUnpublished"
    | "play_ChooseChallengeVariant"
    | "play_IgnoreSessionResetSettings"
    | "play_IgnoreExecutionWindow"
    | "practice_EditSettings"
    | "reports_View"
    | "scores_AwardManualBonuses"
    | "scores_RegradeAndRerank"
    | "scores_ViewLive"
    | "support_EditSettings"
    | "support_ManageTickets"
    | "support_ViewTickets"
    | "systemNotifications_CreateEdit"
    | "teams_ApproveNameChanges"
    | "teams_DeployGameResources"
    | "teams_EditSession"
    | "teams_Enroll"
    | "teams_Observe"
    | "teams_SendAnnouncements"
    | "users_CreateEditDelete"
    | "users_EditRoles"

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

export interface UserRolePermissionsOverviewResponse {
    categories: UserRolePermissionsCategory[];
    rolePermissions: { [key: string]: UserRolePermissionKey[]; };
    yourRole: UserRole;
}
