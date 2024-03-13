// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ApiModule } from '../api/api.module';
import { CoreModule } from '../core/core.module';
import { SponsorsModule } from '@/sponsors/sponsors.module';
import { UtilityModule } from '../utility/utility.module';

import { ActiveChallengesModalComponent } from './components/active-challenges-modal/active-challenges-modal.component';
import { AdminOverviewComponent } from './components/admin-overview/admin-overview.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AnnounceComponent } from './announce/announce.component';
import { ChallengeBrowserComponent } from './challenge-browser/challenge-browser.component';
import { ChallengeObserverComponent } from './challenge-observer/challenge-observer.component';
import { ChallengeReportComponent } from './challenge-report/challenge-report.component';
import { ChallengeSpecEditorComponent } from './components/challenge-spec-editor/challenge-spec-editor.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExternalGameAdminComponent } from './components/external-game-admin/external-game-admin.component';
import { ExternalGameAdminPlayerContextMenuComponent } from './components/external-game-admin-player-context-menu/external-game-admin-player-context-menu.component';
import { ExternalGameAdminTeamContextMenuComponent } from './components/external-game-admin-team-context-menu/external-game-admin-team-context-menu.component';
import { ExternalGamePlayerStatusToStatusLightPipe } from './pipes/external-game-player-status-to-status-light.pipe';
import { ExternalTeamToChallengeCreatedPipe } from './pipes/external-team-to-challenge-created.pipe';
import { ExternalTeamChallengesToIsPredeployablePipe } from './pipes/external-team-challenges-to-is-predeployable.pipe';
import { ExternalSpecIdToChallengePipe } from './pipes/external-specid-to-challenge.pipe';
import { ExternalGamePlayerStatusToFriendlyPipe } from './pipes/external-game-player-status-to-friendly.pipe';
import { FeedbackReportComponent } from './feedback-report/feedback-report.component';
import { GameBonusesConfigComponent } from './components/game-bonuses-config/game-bonuses-config.component';
import { GameDesignerComponent } from './game-designer/game-designer.component';
import { GameEditorComponent } from './game-editor/game-editor.component';
import { GameMapperComponent } from './game-mapper/game-mapper.component';
import { ManageManualChallengeBonusesModalComponent } from './components/manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { ManageManualChallengeBonusesComponent } from './components/manage-manual-challenge-bonuses/manage-manual-challenge-bonuses.component';
import { ParticipationReportComponent } from './participation-report/participation-report.component';
import { PlayerNamesComponent } from './player-names/player-names.component';
import { PlayerRegistrarComponent } from './player-registrar/player-registrar.component';
import { PlayerSessionComponent } from './admin-player-session/admin-player-session.component';
import { PlayerSponsorReportComponent } from './player-sponsor-report/player-sponsor-report.component';
import { PracticeComponent } from './practice/practice.component';
import { PracticeSettingsComponent } from './practice/practice-settings/practice-settings.component';
import { PrereqsComponent } from './prereqs/prereqs.component';
import { ReportPageComponent } from './report-page/report-page.component';
import { SiteOverviewStatsComponent } from './components/site-overview-stats/site-overview-stats.component';
import { SpecBrowserComponent } from './spec-browser/spec-browser.component';
import { SponsorBrowserComponent } from './sponsor-browser/sponsor-browser.component';
import { SupportReportLegacyComponent } from './support-report-legacy/support-report-legacy.component';
import { SystemNotificationsModule } from '@/system-notifications/system-notifications.module';
import { TeamAdminContextMenuComponent } from './components/team-admin-context-menu/team-admin-context-menu.component';
import { TeamObserverComponent } from './team-observer/team-observer.component';
import { UserApiKeysComponent } from './user-api-keys/user-api-keys.component';
import { UserRegistrarComponent } from './user-registrar/user-registrar.component';
import { UserReportComponent } from './user-report/user-report.component';
import { AdminSystemNotificationsComponent } from '@/system-notifications/components/admin-system-notifications/admin-system-notifications.component';
import { EventHorizonModule } from '@/event-horizon/event-horizon.module';
import { SupportSettingsComponent } from './components/support-settings/support-settings.component';
import { FeedbackEditorComponent } from './components/feedback-editor/feedback-editor.component';
import { ExtendTeamsModalComponent } from './components/extend-teams-modal/extend-teams-modal.component';
import { ActiveTeamsModalComponent } from './components/active-teams-modal/active-teams-modal.component';
import { AdminEnrollTeamModalComponent } from './components/admin-enroll-team-modal/admin-enroll-team-modal.component';

@NgModule({
  declarations: [
    ActiveChallengesModalComponent,
    AdminPageComponent,
    AnnounceComponent,
    ChallengeBrowserComponent,
    ChallengeObserverComponent,
    ChallengeReportComponent,
    ChallengeSpecEditorComponent,
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
    GameDesignerComponent,
    GameEditorComponent,
    GameMapperComponent,
    ManageManualChallengeBonusesComponent,
    ManageManualChallengeBonusesModalComponent,
    GameBonusesConfigComponent,
    ParticipationReportComponent,
    PlayerNamesComponent,
    PlayerRegistrarComponent,
    PlayerSessionComponent,
    PlayerSponsorReportComponent,
    PracticeComponent,
    PracticeSettingsComponent,
    PrereqsComponent,
    ReportPageComponent,
    SpecBrowserComponent,
    SponsorBrowserComponent,
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
  ],
  imports: [
    CommonModule,
    FormsModule,
    EventHorizonModule,
    RouterModule.forChild([
      {
        path: '', component: AdminPageComponent, title: "Admin", children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          { path: 'dashboard', component: DashboardComponent },
          { path: 'designer/:id', component: GameEditorComponent },
          { path: "game/:gameId/external", component: ExternalGameAdminComponent },
          {
            path: "practice", component: PracticeComponent, children: [
              { path: "", pathMatch: "full", redirectTo: "settings" },
              { path: "settings", component: PracticeSettingsComponent },
            ]
          },
          { path: 'registrar/sponsors', component: SponsorBrowserComponent, title: "Admin | Sponsors" },
          { path: 'registrar/users', component: UserRegistrarComponent, title: "Admin | Users" },
          { path: 'registrar/players', component: PlayerNamesComponent },
          { path: 'registrar/:id', component: PlayerRegistrarComponent },
          { path: 'observer/challenges/:id', component: ChallengeObserverComponent, title: "Admin | Observe" },
          { path: 'observer/teams/:id', component: TeamObserverComponent },
          { path: 'overview', component: AdminOverviewComponent, title: "Admin | Overview" },
          { path: 'report', component: ReportPageComponent, title: "Admin | Reports" },
          { path: 'report/users', component: UserReportComponent },
          { path: 'report/sponsors', component: PlayerSponsorReportComponent },
          { path: 'report/challenges', component: ChallengeReportComponent },
          { path: 'report/feedback', component: FeedbackReportComponent },
          { path: 'report/support', component: SupportReportLegacyComponent },
          { path: 'report/participation', component: ParticipationReportComponent },
          { path: "notifications", component: AdminSystemNotificationsComponent },
          { path: "support/settings", component: SupportSettingsComponent },
          { path: 'support', component: ChallengeBrowserComponent }
        ]
      },
    ]),
    CoreModule,
    ApiModule,
    UtilityModule,
    SponsorsModule,
    SystemNotificationsModule,
  ]
})
export class AdminModule { }
