import { Component, Input, OnChanges, OnInit, SimpleChanges, forwardRef } from '@angular/core';
import { SimpleEntity } from '../../../../api/models';
import { Observable } from 'rxjs';
import { ReportsService } from '../../../reports.service';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '@/core/components/custom-input/custom-input.component';

@Component({
  selector: 'app-parameter-challenge-spec',
  templateUrl: './parameter-challenge-spec.component.html',
  styleUrls: ['./parameter-challenge-spec.component.scss'],
  providers: [createCustomInputControlValueAccessor(ParameterChallengeSpecComponent)]
})
export class ParameterChallengeSpecComponent extends CustomInputComponent<string> implements OnChanges, OnInit {
  @Input() gameId?: string;
  specs$?: Observable<SimpleEntity[]>;

  constructor(private reportsService: ReportsService) {
    super();
  }

  ngOnInit(): void {
    this.loadChallengeSpecs(this.gameId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadChallengeSpecs(this.gameId);
  }

  private loadChallengeSpecs(gameId?: string) {
    this.specs$ = this.reportsService.getChallengeSpecs(this.gameId);
  }
}
