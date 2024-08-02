import { Component, Input } from '@angular/core';
import { ReportsService } from '@/reports/reports.service';
import { SimpleEntity } from '@/api/models';
import { Observable } from 'rxjs';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';
import { GameChallengeSpecQueryModel } from '@/core/models/game-challenge-spec-query-param.model';

export interface ReportGameChallengeSpec {
  gameId?: string;
  challengeSpecId?: string;
}

@Component({
  selector: 'app-parameter-game-challengespec',
  templateUrl: './parameter-game-challengespec.component.html',
  styleUrls: ['./parameter-game-challengespec.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterGameChallengespecComponent)]
})
export class ParameterGameChallengespecComponent
  extends CustomInputComponent<GameChallengeSpecQueryModel> {

  games$: Observable<SimpleEntity[]>;
  challengeSpecs$!: Observable<SimpleEntity[]>;

  constructor(private reportsService: ReportsService) {
    super();
    this.games$ = this.reportsService.getGames();
    this.loadChallengeSpecs(this.ngModel?.gameId);
  }

  handleGameChanged(event$: Event) {
    this.loadChallengeSpecs(this.ngModel?.gameId);
  }

  private loadChallengeSpecs(gameId: string | null | undefined) {
    this.challengeSpecs$ = this.reportsService.getChallengeSpecs(gameId || undefined);

    if (this.ngModel) {
      this.ngModel.challengeSpecId = null;
      this.handleNgModelChange();
    }
  }

  protected handleNgModelChange() {
    this.ngModelChange.emit(this.ngModel);
  }
}
