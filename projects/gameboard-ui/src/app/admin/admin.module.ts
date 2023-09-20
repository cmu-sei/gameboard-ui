// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { PracModule } from '@/prac/prac.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ApiModule } from '../api/api.module';
import { CoreModule } from '../core/core.module';
import { UtilityModule } from '../utility/utility.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AnnounceComponent } from './announce/announce.component';
import { ChallengeBrowserComponent } from './challenge-browser/challenge-browser.component';
import { ChallengeObserverComponent } from './challenge-observer/challenge-observer.component';
import { ChallengeReportComponent } from './challenge-report/challenge-report.component';
import { ManageManualChallengeBonusesModalComponent } from './components/manage-manual-challenge-bonuses-modal/manage-manual-challenge-bonuses-modal.component';
import { ManageManualChallengeBonusesComponent } from './components/manage-manual-challenge-bonuses/manage-manual-challenge-bonuses.component';
import { TeamAdminContextMenuComponent } from './components/team-admin-context-menu/team-admin-context-menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FeedbackReportComponent } from './feedback-report/feedback-report.component';
import { GameDesignerComponent } from './game-designer/game-designer.component';
import { GameEditorComponent } from './game-editor/game-editor.component';
import { GameMapperComponent } from './game-mapper/game-mapper.component';
import { ParticipationReportComponent } from './participation-report/participation-report.component';
import { PlayerNamesComponent } from './player-names/player-names.component';
import { PlayerRegistrarComponent } from './player-registrar/player-registrar.component';
import { PlayerSessionComponent } from './player-session/player-session.component';
import { PlayerSponsorReportComponent } from './player-sponsor-report/player-sponsor-report.component';
import { PracticeChallengesComponent } from './practice/practice-challenges/practice-challenges.component';
import { PracticeSettingsComponent } from './practice/practice-settings/practice-settings.component';
import { PracticeComponent } from './practice/practice.component';
import { PrereqsComponent } from './prereqs/prereqs.component';
import { ReportPageComponent } from './report-page/report-page.component';
import { SpecBrowserComponent } from './spec-browser/spec-browser.component';
import { SponsorBrowserComponent } from './sponsor-browser/sponsor-browser.component';
import { SupportReportLegacyComponent } from './support-report-legacy/support-report-legacy.component';
import { TeamObserverComponent } from './team-observer/team-observer.component';
import { UserApiKeysComponent } from './user-api-keys/user-api-keys.component';
import { UserRegistrarComponent } from './user-registrar/user-registrar.component';
import { UserReportComponent } from './user-report/user-report.component';
import { SponsorsModule } from '@/sponsors/sponsors.module';

@NgModule({
  declarations: [
    AdminPageComponent,
    AnnounceComponent,
    ChallengeBrowserComponent,
    ChallengeObserverComponent,
    ChallengeReportComponent,
    DashboardComponent,
    FeedbackReportComponent,
    GameDesignerComponent,
    GameEditorComponent,
    GameMapperComponent,
    ManageManualChallengeBonusesComponent,
    ManageManualChallengeBonusesModalComponent,
    ParticipationReportComponent,
    PlayerNamesComponent,
    PlayerRegistrarComponent,
    PlayerSessionComponent,
    PlayerSponsorReportComponent,
    PracticeComponent,
    PracticeChallengesComponent,
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
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '', component: AdminPageComponent, title: "Admin", children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          { path: 'dashboard', component: DashboardComponent },
          { path: 'designer/:id', component: GameEditorComponent },
          {
            path: "practice", component: PracticeComponent, children: [
              { path: "", pathMatch: "full", redirectTo: "settings" },
              { path: "challenges", component: PracticeChallengesComponent },
              { path: "settings", component: PracticeSettingsComponent },
            ]
          },
          { path: 'registrar/sponsors', component: SponsorBrowserComponent, title: "Admin | Sponsors" },
          { path: 'registrar/users', component: UserRegistrarComponent, title: "Admin | Users" },
          { path: 'registrar/players', component: PlayerNamesComponent },
          { path: 'registrar/:id', component: PlayerRegistrarComponent },
          { path: 'observer/challenges/:id', component: ChallengeObserverComponent },
          { path: 'observer/teams/:id', component: TeamObserverComponent },
          { path: 'report', component: ReportPageComponent },
          { path: 'report/users', component: UserReportComponent },
          { path: 'report/sponsors', component: PlayerSponsorReportComponent },
          { path: 'report/challenges', component: ChallengeReportComponent },
          { path: 'report/feedback', component: FeedbackReportComponent },
          { path: 'report/support', component: SupportReportLegacyComponent },
          { path: 'report/participation', component: ParticipationReportComponent },
          { path: 'support', component: ChallengeBrowserComponent }
        ]
      },
    ]),
    CoreModule,
    ApiModule,
    UtilityModule,
    ButtonsModule,
    AlertModule,
    ModalModule,
    TooltipModule,
    FontAwesomeModule,
    SponsorsModule,
  ]
})
export class AdminModule { }
