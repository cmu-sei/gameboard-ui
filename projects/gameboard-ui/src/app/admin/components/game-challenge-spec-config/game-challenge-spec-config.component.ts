import { Spec } from '@/api/spec-models';
import { FontAwesomeService } from '@/services/font-awesome.service';
import { ChallengeSpecScoringConfig } from '@/services/scoring/scoring.models';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-game-challenge-spec-config',
  templateUrl: './game-challenge-spec-config.component.html',
  styleUrls: ['./game-challenge-spec-config.component.scss']
})
export class GameEditorChallengeSpecConfigComponent {
  @Input() spec?: Spec;
  @Input() scoringConfig?: ChallengeSpecScoringConfig;
  @Output() updated = new EventEmitter<Spec>();
  @Output() deleted = new EventEmitter<Spec>();

  constructor(public faService: FontAwesomeService) { }

  handleDeleteClick(spec: Spec) {
    this.deleted.emit(spec);
  }

  handleModelUpdated(spec: Spec) {
    this.updated.emit(spec);
  }
}
