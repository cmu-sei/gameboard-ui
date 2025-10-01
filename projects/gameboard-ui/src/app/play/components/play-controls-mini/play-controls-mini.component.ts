// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Challenge } from '@/api/board-models';
import { ChallengesService } from '@/api/challenges.service';
import { ChallengeSolutionGuide } from '@/api/challenges.models';

@Component({
  selector: 'app-play-controls-mini',
  templateUrl: './play-controls-mini.component.html',
  styleUrls: ['./play-controls-mini.component.scss']
})
export class PlayControlsMiniComponent implements OnChanges {
  @Input() challengeId?: string;

  protected challenge?: Challenge;
  protected solutionGuide?: ChallengeSolutionGuide;

  constructor(private challengeService: ChallengesService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes.challengeId)
      return;

    await this.loadChallenge(changes.challengeId.currentValue);
  }

  private async loadChallenge(challengeId: string) {
    this.challenge = await firstValueFrom(this.challengeService.retrieve(challengeId));
  }
}
