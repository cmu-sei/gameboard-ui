// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { faTrash, faList, faSearch, faFilter, faCheck, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, interval, merge, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { ApiUser, UserRole } from '../../api/user-models';
import { UserService } from '../../api/user.service';

@Component({
  selector: 'app-user-registrar',
  templateUrl: './user-registrar.component.html',
  styleUrls: ['./user-registrar.component.scss']
})
export class UserRegistrarComponent {
  refresh$ = new BehaviorSubject<boolean>(true);
  source$: Observable<ApiUser[]>;
  source: ApiUser[] = [];
  selected: ApiUser[] = [];
  viewed: ApiUser | undefined = undefined;
  viewChange$ = new BehaviorSubject<ApiUser | undefined>(this.viewed);
  search: Search = { term: '', take: 0 };
  filter = '';
  scope = '';
  scopes: string[] = [];
  reasons: string[] = ['disallowed', 'disallowed_pii', 'disallowed_unit', 'disallowed_agency', 'disallowed_explicit', 'disallowed_innuendo', 'disallowed_excessive_emojis', 'not_unique'];
  errors: any[] = [];

  faTrash = faTrash;
  faList = faList;
  faSearch = faSearch;
  faFilter = faFilter;
  faCheck = faCheck;
  faArrowLeft = faArrowLeft;

  constructor(
    private api: UserService,
  ) {
    this.source$ = merge(
      this.refresh$,
      interval(60000)
    ).pipe(
      debounceTime(500),
      switchMap(() => this.api.list(this.search)),
      tap(r => this.source = r),
      tap(() => this.review()),
    );
  }

  toggleFilter(role: string): void {
    this.filter = this.filter !== role ? role : '';
    this.search.filter = [this.filter];
    this.refresh$.next(true);
  }

  toggleScope(scope: string): void {
    this.scope = this.scope !== scope ? scope : '';
    // this.search.scope = this.scope;
    this.refresh$.next(true);
  }

  view(u: ApiUser): void {
    this.viewed = this.viewed !== u ? u : undefined;

    if (this.viewed) {
      this.updateRoleString(u);
    }

    this.viewChange$.next(this.viewed);
  }

  review(): void {
    this.viewed = this.source.find(g => g.id === this.viewed?.id);
  }

  delete(model: ApiUser): void {
    this.api.delete(model.id).subscribe(() => {
      const found = this.source.find(f => f.id === model.id);
      if (found) {
        this.source.splice(
          this.source.indexOf(found),
          1
        );
      }
    });
  }

  update(model: ApiUser): void {
    this.api.update(model).subscribe(
      () => this.updateRoleString(model),
      (err) => this.errors.push(err)
    );
  }

  approveName(model: ApiUser): void {
    model.approvedName = model.name;
    model.nameStatus = "";
    model.pendingName = "";
    this.update(model);
  }

  role(model: ApiUser, r: string): void {
    let a = model.role.split(', ');
    const b = a.find(i => i === r);

    if (b) {
      a = a.filter(i => i !== b);
    } else {
      a.push(r);
    }

    model.role = !!a.length
      ? a.join(', ') as UserRole : UserRole.member;

    this.update(model);
  }

  private updateRoleString(u: ApiUser) {
    for (let role of u.role.split(",")) {
      const roleName = role.trim();
      (u as any)[`is${roleName.substring(0, 1).toUpperCase()}${roleName.substring(1)}`] = true;
    }
  }

  trackById(index: number, model: ApiUser): string {
    return model.id;
  }
}
