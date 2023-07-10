// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, interval, merge, Observable } from 'rxjs';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { Search, SortDirection } from '../../api/models';
import { ApiUser, UserRole } from '../../api/user-models';
import { UserService } from '../../api/user.service';
import { FontAwesomeService } from '@/services/font-awesome.service';
import { SortService } from '@/services/sort.service';

type UserRegistrarSort = "name" | "lastLogin" | "createdOn";

@Component({
  selector: 'app-user-registrar',
  templateUrl: './user-registrar.component.html',
  styleUrls: ['./user-registrar.component.scss']
})
export class UserRegistrarComponent implements OnInit {
  refresh$ = new BehaviorSubject<boolean>(true);
  source$: Observable<ApiUser[]>;
  source: ApiUser[] = [];
  selected: ApiUser[] = [];
  viewed: ApiUser | undefined = undefined;
  viewChange$ = new BehaviorSubject<ApiUser | undefined>(this.viewed);
  search: Search = { term: '', take: 0, sort: "name" };
  filter = '';
  reasons: string[] = ['disallowed', 'disallowed_pii', 'disallowed_unit', 'disallowed_agency', 'disallowed_explicit', 'disallowed_innuendo', 'disallowed_excessive_emojis', 'not_unique'];
  errors: any[] = [];

  constructor(
    private api: UserService,
    private sortService: SortService,
    public fa: FontAwesomeService,
  ) {
    this.source$ = merge(
      this.refresh$,
      interval(60000)
    ).pipe(
      debounceTime(500),
      switchMap(() => this.api.list(this.search)),
      map(r => this.sortResults(r, this.search.sort as UserRegistrarSort, this.search.sortDirection || "asc")),
      tap(r => this.source = r),
      tap(() => this.review()),
    );
  }

  ngOnInit(): void {

  }

  toggleFilter(role: string): void {
    this.filter = this.filter !== role ? role : '';
    this.search.filter = [this.filter];
    this.refresh$.next(true);
  }

  setSort(sort: UserRegistrarSort) {
    // choose a sensible default for new sorts, or invert order for repeated sort
    if (this.search.sort && sort && sort !== this.search.sort) {
      this.search.sortDirection = "asc";
    }
    else if (this.search.sort === sort) {
      this.search.sortDirection = this.search.sortDirection === "asc" ? "desc" : "asc";
    }

    this.search.sort = sort;
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

  private sortResults(results: ApiUser[], sort: UserRegistrarSort, direction: SortDirection) {
    console.log("direction", direction);
    switch (sort) {
      case "lastLogin":
        return this.sortService.sort<ApiUser, number>({
          array: results,
          transform: user => (user.lastLoginDate || new Date(0)).valueOf(),
          direction: direction
        });
      case "createdOn":
        return this.sortService.sort<ApiUser, number>({
          array: results,
          transform: user => user.createdOn.valueOf(),
          direction: direction
        });
      default:
        return this.sortService.sort({
          array: results,
          transform: user => user.approvedName || user.name || "",
          direction: direction
        });
    }

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
