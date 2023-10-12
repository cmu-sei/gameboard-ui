import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { Search } from '@/api/models';
import { SpecSummary } from '@/api/spec-models';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { slug } from '@/tools/functions';

@Component({
  selector: 'app-practice-challenge-list',
  templateUrl: './practice-challenge-list.component.html',
  styleUrls: ['./practice-challenge-list.component.scss']
})
export class PracticeChallengeListComponent {
  list$: Observable<SpecSummary[]>;
  search$ = new BehaviorSubject<Search>({});
  appname = '';
  faSearch = faSearch;

  protected canPlayPracticeChallenges$: Observable<boolean>;
  protected hasSponsor$: Observable<boolean>;
  protected localUserId?: string;
  protected introTextMarkdown = "";
  protected suggestedSearches: string[] = [];

  term = "";
  count = 0;
  skip = 0;
  take = 1;
  protected slug = slug;

  private static readonly DEFAULT_PAGE_SIZE = 100;

  constructor(
    route: ActivatedRoute,
    private api: PracticeService,
    private localUser: LocalUserService,
    private routerService: RouterService
  ) {

    this.list$ = route.queryParams.pipe(
      map(queryParams => ({
        skip: queryParams.skip,
        take: queryParams.take || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE,
        term: queryParams.term,
      } as Search)),
      switchMap(m => api.searchChallenges(m)),
      tap(r => {
        this.count = r.results.paging.itemCount;
        this.skip = (r.results.paging.pageNumber || 0) * (r.results.paging.pageSize || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE);
        this.take = r.results.paging.pageSize || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE;
        this.term = route.snapshot.queryParams.term || "";
      }),
      map(results => results.results.items)
    );

    this.hasSponsor$ = localUser.user$.pipe(map(u => !!u?.sponsor && !u.hasDefaultSponsor));

    this.canPlayPracticeChallenges$ = combineLatest([
      localUser.user$,
      this.hasSponsor$
    ]).pipe(
      map(sponsorAndUser => ({ user: sponsorAndUser[0], hasSponsor: sponsorAndUser[1] })),
      map(canPlayCtx => canPlayCtx.hasSponsor && !!canPlayCtx.user)
    );
  }

  async ngOnInit(): Promise<void> {
    this.localUserId = this.localUser.user$.value?.id;
    const settings = await firstValueFrom(this.api.getSettings());
    this.introTextMarkdown = settings.introTextMarkdown;
    this.suggestedSearches = settings.suggestedSearches;
  }

  paged(s: number): void {
    this.routerService.updateQueryParams({
      parameters: {
        skip: s, navigate: true
      }
    });
  }
}
