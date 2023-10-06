import { Spec } from '@/api/spec-models';
import { SpecService } from '@/api/spec.service';
import { fa } from '@/services/font-awesome.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { slug } from '@/tools/functions';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Subject, debounceTime, filter, firstValueFrom, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-challenge-spec-editor',
  templateUrl: './challenge-spec-editor.component.html',
  styleUrls: ['./challenge-spec-editor.component.scss']
})
export class ChallengeSpecEditorComponent implements OnChanges {
  @Input() spec?: Spec;
  @Output() specDelete = new EventEmitter<Spec>();
  @Output() specUpdate = new EventEmitter<Spec>();

  protected fa = fa;
  protected slug = slug;
  protected requestUpdateSpec$ = new Subject<Spec>();

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.spec) {
      throw new Error("The ChallengeSpecEditor requires a challenge spec.");
    }
  }

  protected handleSpecUpdated(spec: Spec) {
    this.specUpdate.emit(spec);
  }

  protected handleSpecDeleted(spec: Spec) {
    this.specDelete.emit(spec);
  }
}
