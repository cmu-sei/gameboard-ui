import { AsyncPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MarkdownPipe } from 'ngx-markdown';
import { CoreModule } from '@/core/core.module';
import { ChallengeGroupCardImagePipe } from '@/prac/pipes/challenge-group-card-image.pipe';
import { PracticeChallengeGroupDto } from '@/prac/practice.models';
import { ListPracticeChallengeGroupsResponseGroup } from '@/prac/models/list-practice-challenge-groups';
import { UrlTree } from '@angular/router';
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
  group = input.required<ListPracticeChallengeGroupsResponseGroup | PracticeChallengeGroupDto>();
  // just a renaming of RouterLink (if you call this routerLink, Angular interprets this as you wanting to put its RouterLink directive on this component)
  linkTo = input<string | any[] | UrlTree | null | undefined>();
}
