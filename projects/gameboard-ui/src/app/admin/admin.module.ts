// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ScoreboardModule } from '@/scoreboard/scoreboard.module';
import { SponsorsModule } from '@/sponsors/sponsors.module';
import { ApiModule } from '../api/api.module';
import { CoreModule } from '../core/core.module';
import { UtilityModule } from '../utility/utility.module';

import { EventHorizonModule } from '@/event-horizon/event-horizon.module';
import { AdminSystemNotificationsComponent } from '@/system-notifications/components/admin-system-notifications/admin-system-notifications.component';
import { SystemNotificationsModule } from '@/system-notifications/system-notifications.module';

import { ActiveChallengesModalComponent } from './components/active-challenges-modal/active-challenges-modal.component';
import { ActiveTeamsModalComponent } from './components/active-teams-modal/active-teams-modal.component';
import { AdminEnrollTeamModalComponent } from './components/admin-enroll-team-modal/admin-enroll-team-modal.component';
import { AdminOverviewComponent } from './components/admin-overview/admin-overview.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminRolesComponent } from './components/admin-roles/admin-roles.component';
import { AnnounceComponent } from './announce/announce.component';
import { ChallengeBrowserComponent } from './challenge-browser/challenge-browser.component';
import { ChallengeObserverComponent } from './challenge-observer/challenge-observer.component';
import { ChallengeReportComponent } from './challenge-report/challenge-report.component';
import { ChallengeSpecEditorComponent } from './components/challenge-spec-editor/challenge-spec-editor.component';
import { CreateUsersModalComponent } from './components/create-users-modal/create-users-modal.component';
import { DeleteExternalGameHostModalComponent } from './components/delete-external-game-host-modal/delete-external-game-host-modal.component';
import { ExtendTeamsModalComponent } from './components/extend-teams-modal/extend-teams-modal.component';
import { ExternalGameAdminPlayerContextMenuComponent } from './components/external-game-admin-player-context-menu/external-game-admin-player-context-menu.component';
import { ExternalGameAdminTeamContextMenuComponent } from './components/external-game-admin-team-context-menu/external-game-admin-team-context-menu.component';
import { ExternalGameAdminComponent } from './components/external-game-admin/external-game-admin.component';
import { ExternalGameHostPickerComponent } from './components/external-game-host-picker/external-game-host-picker.component';
import { ExternalHostEditorComponent } from './components/external-host-editor/external-host-editor.component';
import { FeedbackEditorComponent } from './components/feedback-editor/feedback-editor.component';
import { GameBonusesConfigComponent } from './components/game-bonuses-config/game-bonuses-config.component';
import { GameCenterObserveComponent } from './components/game-center/game-center-observe/game-center-observe.component';
import { GameCenterPracticePlayerDetailComponent } from './components/game-center/game-center-practice-player-detail/game-center-practice-player-detail.component';
import { GameCenterPracticeComponent } from './components/game-center/game-center-practice/game-center-practice.component';
import { GameCenterSettingsComponent } from './components/game-center/game-center-settings/game-center-settings.component';
import { GameCenterTeamContextMenuComponent } from './components/game-center/game-center-team-context-menu/game-center-team-context-menu.component';
import { GameCenterTeamDetailComponent } from './components/game-center/game-center-team-detail/game-center-team-detail.component';
import { GameCenterTeamsComponent } from './components/game-center/game-center-teams/game-center-teams.component';
import { GameCenterTicketsComponent } from './components/game-center/game-center-tickets/game-center-tickets.component';
import { GameCenterComponent } from './components/game-center/game-center.component';
import { GameMapEditorComponent } from './components/game-map-editor/game-map-editor.component';
import { GameYamlImportModalComponent } from './components/game-yaml-import-modal/game-yaml-import-modal.component';
import { ManageManualChallengeBonusesModalComponent } from './components/manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { ManageManualChallengeBonusesComponent } from './components/manage-manual-challenge-bonuses/manage-manual-challenge-bonuses.component';
import { PlayerSessionComponent } from './admin-player-session/admin-player-session.component';
import { SiteOverviewStatsComponent } from './components/site-overview-stats/site-overview-stats.component';
import { SupportSettingsComponent } from './components/support-settings/support-settings.component';
import { TeamAdminContextMenuComponent } from './components/team-admin-context-menu/team-admin-context-menu.component';
import { TeamCenterComponent } from './components/team-center/team-center.component';
import { TeamListCardComponent } from './components/team-list-card/team-list-card.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FeedbackReportComponent } from './feedback-report/feedback-report.component';
import { GameMapperComponent } from './game-mapper/game-mapper.component';
import { ParticipationReportComponent } from './participation-report/participation-report.component';
import { ExternalGamePlayerStatusToFriendlyPipe } from './pipes/external-game-player-status-to-friendly.pipe';
import { ExternalGamePlayerStatusToStatusLightPipe } from './pipes/external-game-player-status-to-status-light.pipe';
import { ExternalSpecIdToChallengePipe } from './pipes/external-specid-to-challenge.pipe';
import { ExternalTeamChallengesToIsPredeployablePipe } from './pipes/external-team-challenges-to-is-predeployable.pipe';
import { ExternalTeamToChallengeCreatedPipe } from './pipes/external-team-to-challenge-created.pipe';
import { GameClassificationToStringPipe } from './pipes/game-classification-to-string.pipe';
import { SupportAutoTagAdminComponent } from './components/support-auto-tag-admin/support-auto-tag-admin.component';
import { SyncStartGameStateDescriptionPipe } from './pipes/sync-start-game-state-description.pipe';
import { SyncStartTeamPlayerReadyCountPipe } from './pipes/sync-start-team-player-ready-count.pipe';
import { PlayerNamesComponent } from './player-names/player-names.component';
import { PlayerSponsorReportComponent } from './player-sponsor-report/player-sponsor-report.component';
import { PracticeSettingsComponent } from './practice/practice-settings/practice-settings.component';
import { PracticeComponent } from './practice/practice.component';
import { PrereqsComponent } from './prereqs/prereqs.component';
import { SpecBrowserComponent } from './spec-browser/spec-browser.component';
import { SponsorBrowserComponent } from './sponsor-browser/sponsor-browser.component';
import { SupportReportLegacyComponent } from './support-report-legacy/support-report-legacy.component';
import { TeamObserverComponent } from './team-observer/team-observer.component';
import { UserApiKeysComponent } from './user-api-keys/user-api-keys.component';
import { UserRegistrarComponent } from './user-registrar/user-registrar.component';
import { UserReportComponent } from './user-report/user-report.component';
import { GameInfoBubblesComponent } from "../standalone/components/game-info-bubbles/game-info-bubbles.component";
import { ScoreboardComponent } from '@/scoreboard/components/scoreboard/scoreboard.component';
import { GameIdResolver } from './resolvers/game-id.resolver';

@NgModule({
  declarations: [
    ActiveChallengesModalComponent,
    AdminPageComponent,
    AdminRolesComponent,
    AnnounceComponent,
    ChallengeBrowserComponent,
    ChallengeObserverComponent,
    ChallengeReportComponent,
    ChallengeSpecEditorComponent,
    CreateUsersModalComponent,
    DashboardComponent,
    ExternalGameAdminComponent,
    ExternalGameAdminPlayerContextMenuComponent,
    ExternalGameAdminTeamContextMenuComponent,
    ExternalGamePlayerStatusToStatusLightPipe,
    ExternalSpecIdToChallengePipe,
    ExternalGamePlayerStatusToFriendlyPipe,
    ExternalTeamToChallengeCreatedPipe,
    ExternalTeamChallengesToIsPredeployablePipe,
    FeedbackReportComponent,
    GameCenterComponent,
    GameCenterPracticeComponent,
    GameCenterPracticePlayerDetailComponent,
    GameCenterSettingsComponent,
    GameCenterObserveComponent,
    GameCenterTeamContextMenuComponent,
    GameCenterTeamsComponent,
    GameCenterTicketsComponent,
    GameClassificationToStringPipe,
    GameMapperComponent,
    ManageManualChallengeBonusesComponent,
    ManageManualChallengeBonusesModalComponent,
    GameBonusesConfigComponent,
    ParticipationReportComponent,
    PlayerNamesComponent,
    PlayerSessionComponent,
    PlayerSponsorReportComponent,
    PracticeComponent,
    PracticeSettingsComponent,
    PrereqsComponent,
    SpecBrowserComponent,
    SponsorBrowserComponent,
    SupportAutoTagAdminComponent,
    SupportReportLegacyComponent,
    TeamAdminContextMenuComponent,
    TeamObserverComponent,
    UserApiKeysComponent,
    UserRegistrarComponent,
    UserReportComponent,
    SiteOverviewStatsComponent,
    AdminOverviewComponent,
    SupportSettingsComponent,
    FeedbackEditorComponent,
    ExtendTeamsModalComponent,
    ActiveTeamsModalComponent,
    AdminEnrollTeamModalComponent,
    GameYamlImportModalComponent,
    SyncStartTeamPlayerReadyCountPipe,
    SyncStartGameStateDescriptionPipe,
    ExternalGameHostPickerComponent,
    ExternalHostEditorComponent,
    DeleteExternalGameHostModalComponent,
    TeamListCardComponent,
    GameCenterTeamDetailComponent,
    TeamCenterComponent,
    GameMapEditorComponent,
  ],
  imports: [
    CommonModule,
    EventHorizonModule,
    RouterModule.forChild([
      {
        path: '', component: AdminPageComponent, title: "Admin", children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          { path: 'dashboard', component: DashboardComponent },
          {
            path: "game/:gameId",
            component: GameCenterComponent,
            title: "Game Center",
            children: [
              { path: "settings", component: GameCenterSettingsComponent, resolve: { gameId: GameIdResolver } },
              { path: "challenges", component: GameMapperComponent, resolve: { gameId: GameIdResolver } },
              { path: "teams", component: GameCenterTeamsComponent, resolve: { gameId: GameIdResolver } },
              { path: "observe", component: GameCenterObserveComponent, resolve: { gameId: GameIdResolver } },
              { path: "practice", component: GameCenterPracticeComponent, resolve: { gameId: GameIdResolver } },
              { path: "deployment", component: ExternalGameAdminComponent, resolve: { gameId: GameIdResolver } },
              { path: "tickets", component: GameCenterTicketsComponent, resolve: { gameId: GameIdResolver } },
              { path: "scoreboard", component: ScoreboardComponent, resolve: { gameId: GameIdResolver } },
              { path: '', pathMatch: 'full', redirectTo: "teams" }
            ]
          },
          {
            path: 'game/:gameId',
            component: GameCenterComponent,
            pathMatch: 'full'
          },
          {
            path: "game/:gameId/external", pathMatch: 'full', component: ExternalGameAdminComponent
          },
          {
            path: "practice", component: PracticeComponent, children: [
              { path: "", pathMatch: "full", redirectTo: "settings" },
              { path: "settings", component: PracticeSettingsComponent },
            ]
          },
          { path: 'registrar/sponsors', component: SponsorBrowserComponent, title: "Sponsors | Admin" },
          { path: 'registrar/users', component: UserRegistrarComponent, title: "Users | Admin" },
          { path: 'registrar/players', component: PlayerNamesComponent, title: "Players | Admin" },
          { path: 'observer/challenges/:id', component: ChallengeObserverComponent, title: "Observe | Admin" },
          { path: 'observer/teams/:id', component: TeamObserverComponent },
          { path: 'overview', component: AdminOverviewComponent, title: "Live | Admin " },
          { path: "permissions", component: AdminRolesComponent, title: "Permissions | Admin" },
          { path: 'report/users', component: UserReportComponent },
          { path: 'report/sponsors', component: PlayerSponsorReportComponent },
          { path: 'report/challenges', component: ChallengeReportComponent },
          { path: 'report/feedback', component: FeedbackReportComponent },
          { path: 'report/support', component: SupportReportLegacyComponent },
          { path: 'report/participation', component: ParticipationReportComponent },
          { path: "notifications", component: AdminSystemNotificationsComponent, title: "System Notifications | Admin" },
          { path: "support/settings", component: SupportSettingsComponent, title: "Support | Admin" },
          { path: 'support', component: ChallengeBrowserComponent, title: "Challenges | Admin" }
        ]
      },
    ]),
    CoreModule,
    ApiModule,
    UtilityModule,
    ScoreboardModule,
    SponsorsModule,
    SystemNotificationsModule,
    GameInfoBubblesComponent
  ]
})
export class AdminModule { }
