import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReportParameterComponent } from '../report-parameter-component';
import { SimpleEntity } from '../../../api/models';
import { Observable } from 'rxjs';
import { ReportsService } from '../../reports.service';

@Component({
  selector: 'app-parameter-challenge-spec',
  templateUrl: './parameter-challenge-spec.component.html',
  styleUrls: ['./parameter-challenge-spec.component.scss']
})
export class ParameterChallengeSpecComponent extends ReportParameterComponent implements OnChanges, OnInit {
  @Input() gameId?: string;
  specs$?: Observable<SimpleEntity[]>;
  selectedSpec?: SimpleEntity;

  constructor(private reportsService: ReportsService) {
    super();
  }

  ngOnInit(): void {
    this.loadChallengeSpecs(this.gameId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadChallengeSpecs(this.gameId);
  }

  getDefaultValue() {
    return undefined;
  }

  private loadChallengeSpecs(gameId?: string) {
    this.specs$ = this.reportsService.getChallengeSpecOptions(this.gameId);
  }
}
