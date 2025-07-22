import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MarkdownPipe } from 'ngx-markdown';
import { PracticeChallengeGroupDto } from '@/prac/practice.models';
import { ChallengeGroupCardImagePipe } from '@/prac/pipes/challenge-group-card-image.pipe';

@Component({
  selector: 'app-challenge-group-card',
  imports: [
    AsyncPipe,
    ChallengeGroupCardImagePipe,
    MarkdownPipe,
  ],
  templateUrl: './challenge-group-card.component.html',
  styleUrl: './challenge-group-card.component.scss'
})
export class ChallengeGroupCardComponent {
  challengeGroup = input.required<PracticeChallengeGroupDto>();
}
