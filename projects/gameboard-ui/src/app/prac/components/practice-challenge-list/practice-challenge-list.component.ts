import { Search } from '@/api/models';
import { SpecSummary } from '@/api/spec-models';
import { PracticeService } from '@/services/practice.service';
import { RouterService } from '@/services/router.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { UserService as LocalUserService } from "@/utility/user.service";
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable, firstValueFrom, map, switchMap, tap } from 'rxjs';
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
  protected localUserId?: string;
  protected introTextMarkdown = "";

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
    private routerService: RouterService,
    private unsub: UnsubscriberService,
  ) {
    this.list$ = this.search$.pipe(
      switchMap(m => api.searchChallenges(m)),
      tap(r => {
        this.count = r.results.paging.itemCount;
        this.skip = (r.results.paging.pageNumber || 0) * (r.results.paging.pageSize || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE);
        this.take = r.results.paging.pageSize || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE;
        this.term = route.snapshot.queryParams.term || "";
      }),
      map(results => results.results.items)
    );

    this.unsub.add(
      route.queryParams.subscribe(params => this.search({ ...params } as Search))
    );

    this.search({ ...route.snapshot.queryParams } as Search);
  }

  async ngOnInit(): Promise<void> {
    this.localUserId = this.localUser.user$.value?.id;
    const settings = await firstValueFrom(this.api.getSettings());
    this.introTextMarkdown = settings.introTextMarkdown;
  }

  paged(s: number): void {
    this.routerService.updateQueryParams({
      parameters: {
        skip: s, navigate: true
      }
    });
  }

  private search(search: Search) {
    search.take = search.take || PracticeChallengeListComponent.DEFAULT_PAGE_SIZE;
    search.term = search.term || "";
    this.search$.next({ ...search });
  }
}