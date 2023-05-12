import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subject, switchMap, tap } from 'rxjs';
import { SpecService } from '../../../api/spec.service';
import { ChallengeSpecBonusViewModel, Spec } from '../../../api/spec-models';
import { GameService } from '../../../api/game.service';

@Component({
  selector: 'app-challengespec-bonus-config',
  templateUrl: './challengespec-bonus-config.component.html',
  styleUrls: ['./challengespec-bonus-config.component.scss']
})
export class ChallengespecBonusConfigComponent implements OnChanges {
  @Input() gameId?: string;
  selectedSpecId?: string;
  bonuses$: Observable<ChallengeSpecBonusViewModel[]>;
  specs$?: Observable<Spec[]>;

  private update$ = new Subject<void>();

  constructor(
    private gameService: GameService,
    private specService: SpecService) {

    this.bonuses$ = this.update$.pipe(
      switchMap(_ => this.specService.getBonuses(this.selectedSpecId))
    );

    if (this.gameId)
      this.specs$ = this.gameService.retrieveSpecs(this.gameId)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.gameId) {
      this.specs$ = this.gameService.retrieveSpecs(this.gameId);
    }
  }
}
