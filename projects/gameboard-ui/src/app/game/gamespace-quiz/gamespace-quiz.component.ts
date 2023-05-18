// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { BoardSpec, Challenge, ChallengeView, GameState } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { TimeWindow } from '../../api/player-models';

@Component({
  selector: 'app-gamespace-quiz',
  templateUrl: './gamespace-quiz.component.html',
  styleUrls: ['./gamespace-quiz.component.scss']
})
export class GamespaceQuizComponent {
  @Input() spec!: BoardSpec;
  @Input() session!: TimeWindow;
  @Output() graded = new EventEmitter<boolean>();

  pending = false;
  errors: Error[] = [];
  faSubmit = faCloudUploadAlt;

  constructor(private api: BoardService) { }

  submit(): void {
    this.pending = true;

    const submission = {
      id: this.spec.instance!.id,
      sectionIndex: this.spec.instance!.state.challenge?.sectionIndex,
      questions: this.spec.instance!.state.challenge?.questions?.map(q => ({ answer: q.answer }))
    };
    this.api.grade(submission).subscribe(
      (c: Challenge) => {
        this.spec.instance = c;
        this.api.setColor(this.spec);
        this.graded.emit(true);
      },
      (err: any) => this.errors.push(err.error),
      () => this.pending = false
    );
  }
}
