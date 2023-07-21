import { Component } from '@angular/core';
import { ReportParameterComponent, createCustomInputControlValueAccessor } from '../report-parameter-component';
import { ReportsService } from '@/reports/reports.service';
import { SimpleEntity } from '@/api/models';
import { Observable } from 'rxjs';

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
  extends ReportParameterComponent<ReportGameChallengeSpec> {
  games$: Observable<SimpleEntity[]>;
  challengeSpecs$!: Observable<SimpleEntity[]>;

  constructor(private reportsService: ReportsService) {
    super();
    this.games$ = this.reportsService.getGames();
    this.loadChallengeSpecs();
  }

  override getDefaultValue(): ReportGameChallengeSpec | undefined {
    return {};
  }

  handleGameChanged(event$: Event) {
    this.loadChallengeSpecs(this.ngModel?.gameId);
  }

  private loadChallengeSpecs(gameId?: string) {
    this.challengeSpecs$ = this.reportsService.getChallengeSpecs(gameId);

    if (this.ngModel) {
      this.ngModel.challengeSpecId = undefined;
      this.handleNgModelChange();
    }
  }

  protected handleNgModelChange() {
    this.ngModelChange.emit(this.ngModel);
  }
}
