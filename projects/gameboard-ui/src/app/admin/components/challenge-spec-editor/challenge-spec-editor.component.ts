import { Spec } from '@/api/spec-models';
import { SpecService } from '@/api/spec.service';
import { fa } from '@/services/font-awesome.service';
import { ChallengeSpecScoringConfig } from '@/services/scoring/scoring.models';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { slug } from '@/tools/functions';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Subject, debounceTime, filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-challenge-spec-editor',
  templateUrl: './challenge-spec-editor.component.html',
  styleUrls: ['./challenge-spec-editor.component.scss']
})
export class ChallengeSpecEditorComponent implements OnChanges {
  @Input() spec?: Spec;
  @Input() scoringConfig?: ChallengeSpecScoringConfig;
  @Output() specDelete = new EventEmitter<Spec>();
  @Output() specUpdate = new EventEmitter<Spec>();

  protected fa = fa;
  protected slug = slug;
  private requestUpdateSpec$ = new Subject<Spec>();

  constructor(
    private specService: SpecService,
    private unsub: UnsubscriberService) {
    this.unsub.add(
      this.requestUpdateSpec$.pipe(
        debounceTime(500),
        filter(s => s.points >= 0),
        switchMap(s => this.specService.update(s)),
        tap(s => this.specUpdate.emit(s)),
      ).subscribe()
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.spec) {
      throw new Error("The ChallengeSpecEditor requires a challenge spec.");
    }
  }

  protected handleSpecUpdated(spec: Spec) {
    spec.points = spec.points || 0;
    this.requestUpdateSpec$.next(spec);
  }

  protected handleSpecDeleted(spec: Spec) {
    this.specDelete.emit(spec);
  }
}
