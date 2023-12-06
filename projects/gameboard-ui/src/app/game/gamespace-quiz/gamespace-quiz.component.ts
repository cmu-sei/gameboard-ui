// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { BoardSpec } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { TimeWindow } from '../../api/player-models';
import { catchError, firstValueFrom, tap } from 'rxjs';
import { ChallengesService } from '@/api/challenges.service';

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
  errors: any[] = [];
  protected fa = fa;

  constructor(
    private api: BoardService,
    private challengesService: ChallengesService) { }

  async submit(): Promise<void> {
    this.pending = true;
    this.errors = [];

    const submission = {
      id: this.spec.instance!.id,
      sectionIndex: this.spec.instance!.state.challenge?.sectionIndex,
      questions: this.spec.instance!.state.challenge?.questions?.map(q => ({ answer: q.answer })),
    };

    try {
      const gradedChallenge = await firstValueFrom(this.challengesService.grade(submission));
      this.spec.instance = gradedChallenge;
      this.api.setColor(this.spec);
      this.graded.emit(true);
    }
    catch (err) {
      this.errors.push(err);
    }

    this.pending = false;
  }
}
