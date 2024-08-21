import { UserRole } from "./user-models";

export enum UserRolePermissionKey {
    Admin_CreateEditSponsors,
    Admin_View,
    Games_AdminExternal,
    Games_ConfigureChallenges,
    Games_CreateEditDelete,
    Play_IgnoreSessionResetSettings,
    Play_IgnoreExecutionWindow,
    Practice_EditSettings,
    Reports_View,
    Scores_AwardManualBonuses,
    Scores_ViewLive,
    Support_EditSettings,
    Support_ManageTickets,
    SystemNotifications_CreateEdit,
    Teams_ApproveNameChanges,
    Teams_DeployGameResources,
    Teams_EditSession,
    Teams_Enroll,
    Teams_Observe,
    Teams_SendAnnouncements,
    Users_Create
}

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
