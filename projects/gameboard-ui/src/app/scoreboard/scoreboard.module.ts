import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@/core/core.module';

import { ChallengeBonusesToTooltip } from './pipes/challenge-bonuses-to-tooltip';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { ScoreboardTeamDetailModalComponent } from './components/scoreboard-team-detail-modal/scoreboard-team-detail-modal.component';
import { ScoreToTooltipPipe } from './pipes/score-to-tooltip.pipe';
import { SpinnerComponent } from '@/standalone/core/components/spinner/spinner.component';

const PUBLIC_DECLARATIONS = [
  ScoreboardComponent,
  ScoreboardTeamDetailModalComponent,
  ScoreToTooltipPipe
];

@NgModule({
  declarations: [
    ...PUBLIC_DECLARATIONS,
    ChallengeBonusesToTooltip
  ],
  imports: [
    CommonModule,
    CoreModule,
    SpinnerComponent
  ],
  exports: PUBLIC_DECLARATIONS
})
export class ScoreboardModule { }
