import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable, Subscription, map, switchMap, tap } from 'rxjs';
import { Search } from '@/api/models';
import { SpecSummary } from '@/api/spec-models';
import { ConfigService } from '@/utility/config.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { RouterService } from '@/services/router.service';
import { PracticeService } from '@/services/practice.service';

@Component({
  selector: 'app-practice-page',
  templateUrl: './practice-page.component.html',
  styleUrls: ['./practice-page.component.scss']
})
export class PracticePageComponent {
  list$: Observable<SpecSummary[]>;
  search$ = new BehaviorSubject<Search>({});
  appname = '';
  faSearch = faSearch;

  term = "";
  count = 0;
  skip = 0;
  take = 1;

  private static readonly DEFAULT_PAGE_SIZE = 100;

  constructor(
    api: PracticeService,
    config: ConfigService,
    route: ActivatedRoute,
    private routerService: RouterService,
    private unsub: UnsubscriberService
  ) {
    this.appname = config.settings.appname || "Gameboard";

    this.list$ = this.search$.pipe(
      switchMap(m => api.searchChallenges(m)),
      tap(r => {
        this.count = r.results.paging.itemCount;
        this.skip = (r.results.paging.pageNumber || 0) * (r.results.paging.pageSize || PracticePageComponent.DEFAULT_PAGE_SIZE);
        this.take = r.results.paging.pageSize || PracticePageComponent.DEFAULT_PAGE_SIZE;
        this.term = route.snapshot.queryParams.term || "";
      }),
      map(results => results.results.items)
    );

    this.unsub.add(
      route.queryParams.subscribe(params => this.search({ ...params } as Search))
    );

    this.search({ ...route.snapshot.queryParams } as Search);
  }

  paged(s: number): void {
    this.routerService.updateQueryParams({
      parameters: {
        skip: s, navigate: true
      }
    });
  }

  slug(s: string): string {
    return s.toLowerCase().replace(/\W/g, "-").replace("--", "-");
  }

  private search(search: Search) {
    search.take = search.take || PracticePageComponent.DEFAULT_PAGE_SIZE;
    search.term = search.term || "";
    this.search$.next({ ...search });
  }
}
