// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { PluralizerPipe } from '@/core/pipes/pluralizer.pipe';
import { GetPracticeChallengeGroupsUserDataResponseUserData } from '@/prac/models/get-practice-challenge-groups-user-data';
import { PracticeChallengeGroupDto } from '@/prac/practice.models';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-challenge-group-card-user-stats-line',
  imports: [
    PluralizerPipe
  ],
  templateUrl: './challenge-group-card-user-stats-line.component.html',
  styleUrl: './challenge-group-card-user-stats-line.component.scss'
})
export class ChallengeGroupCardUserStatsLineComponent {
  group = input.required<PracticeChallengeGroupDto>();
  userData = input.required<GetPracticeChallengeGroupsUserDataResponseUserData | undefined>();
}
