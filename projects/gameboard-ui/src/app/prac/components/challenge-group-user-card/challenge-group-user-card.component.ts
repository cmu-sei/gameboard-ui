import { AsyncPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MarkdownPipe } from 'ngx-markdown';
import { CoreModule } from '@/core/core.module';
import { ChallengeGroupCardImagePipe } from '@/prac/pipes/challenge-group-card-image.pipe';
import { GetUserChallengeGroupsResponseGroup } from '@/prac/practice.models';
import { PluralizerPipe } from '@/core/pipes/pluralizer.pipe';

@Component({
  selector: 'app-challenge-group-user-card',
  imports: [
    AsyncPipe,
    ChallengeGroupCardImagePipe,
    CoreModule,
    MarkdownPipe,
    PluralizerPipe,
  ],
  templateUrl: './challenge-group-user-card.component.html',
  styleUrl: './challenge-group-user-card.component.scss'
})
export class ChallengeGroupUserCardComponent {
  group = input.required<GetUserChallengeGroupsResponseGroup>();

  protected readonly routerLink = computed(() => `/practice/collections/${this.group().id}`);
}
