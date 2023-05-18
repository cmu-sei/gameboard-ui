// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap, map, tap, delay, catchError } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { LogService } from '../services/log.service';

@Injectable({ providedIn: 'root' })
export class TocService {
  toc$: Observable<TocFile[]>;
  tocfile$: (id: string) => Observable<string>;
  loaded$ = new BehaviorSubject<boolean>(false);
  private cache: TocFile[] = [];

  constructor(
    config: ConfigService,
    private http: HttpClient,
    private log: LogService
  ) {
    const tag = `?t=${new Date().valueOf()}`;
    const tocUrl = `${config.tochost}/${config.settings.tocfile + ''}${tag}`;
    let url = config.tochost;

    // include toc folder
    const i = config.settings.tocfile?.lastIndexOf('/') || 0;
    if (i > 0) {
      url += `/${config.settings.tocfile?.substring(0, i)}`;
    }

    if (!!config.settings.tocfile) {
      this.toc$ = http.get<string[]>(tocUrl).pipe(
        catchError(err => {
          // don't report error here - ops will know what the 404 means
          this.cache = [];
          return [];
        }),
        switchMap((list) => this.mapTocFromList(list)),
        tap(list => this.cache = list),
      );
    }
    else {
      this.log.logInfo("No toc file configured. Skipped loading.");
      this.toc$ = of([]);
    }

    this.toc$ = this.toc$.pipe(tap(toc => this.loaded$.next(true)));

    this.tocfile$ = (id: string) => {
      const tocfile = this.cache.find(f =>
        f.filename === id ||
        f.link === id
      );

      if (!tocfile) {
        return of('not found');
      }

      if (!!tocfile.text) {
        return of(tocfile.text);
      }

      const tocFileUrl = `${url}/${tocfile?.filename}${tag}`;
      return this.http.get(
        tocFileUrl,
        { responseType: 'text' }
      ).pipe(
        catchError(err => {
          // don't report - ops will know 404
          return '';
        }),
        tap(t => tocfile.text = t)
      );
    };
  }

  private mapTocFromList(list: string[]): Observable<TocFile[]> {
    const result: TocFile[] = [];
    list.forEach(x => result.push(({
      filename: x,
      link: x.toLowerCase().replace('/', '-').replace('.md', ''),
      display: (x.split('/').pop() + '').replace('_', ' ').replace('.md', ''),
    })));
    return of(result);
  }
}

export interface TocFile {
  filename: string;
  link: string;
  display: string;
  text?: string;
}
