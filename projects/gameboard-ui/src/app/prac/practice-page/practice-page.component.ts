import { Component } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { SpecSummary } from '../../api/spec-models';
import { SpecService } from '../../api/spec.service';
import { ConfigService } from '../../utility/config.service';

@Component({
  selector: 'app-practice-page',
  templateUrl: './practice-page.component.html',
  styleUrls: ['./practice-page.component.scss']
})
export class PracticePageComponent {
  list$: Observable<SpecSummary[]>;
  search: Search = { take: 100 };
  search$ = new BehaviorSubject<Search>(this.search);
  count = 0;
  appname = '';
  faSearch = faSearch;

  constructor(
    api: SpecService,
    config: ConfigService
  ){
    this.appname = config.settings.appname || "Gameboard";

    this.list$ = this.search$.pipe(
      debounceTime(500),
      switchMap(m => api.browse(m)),
      tap(r => this.count = r.length)
    );
  }

  termed(term: any): void {
    this.search.skip = 0;
    this.search$.next(this.search);
  }

  paged(s: number): void {
    this.search.skip = s;
    this.search$.next(this.search);
  }

}
