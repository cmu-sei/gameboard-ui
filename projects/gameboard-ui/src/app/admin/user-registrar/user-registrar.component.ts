// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { BehaviorSubject, firstValueFrom, interval, merge, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { ApiUser, TryCreateUsersResponse, UserRoleKey } from '../../api/user-models';
import { UserService } from '../../api/user.service';
import { fa } from '@/services/font-awesome.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { CreateUsersModalComponent } from '../components/create-users-modal/create-users-modal.component';
import { ToastService } from '@/utility/services/toast.service';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

type UserRegistrarSort = "name" | "lastLogin" | "createdOn";

@Component({
    selector: 'app-user-registrar',
    templateUrl: './user-registrar.component.html',
    styleUrls: ['./user-registrar.component.scss'],
    standalone: false
})
export class UserRegistrarComponent {
  protected roles$: Observable<UserRoleKey[]>;
  protected isLoading = false;
  refresh$ = new BehaviorSubject<boolean>(true);
  source$: Observable<ApiUser[]>;
  source: ApiUser[] = [];
  selected: ApiUser[] = [];
  viewed: ApiUser | undefined = undefined;
  viewChange$ = new BehaviorSubject<ApiUser | undefined>(this.viewed);
  search: Search = { term: '', take: 200, sort: "name" };
  filter = '';
  reasons: string[] = ['disallowed', 'disallowed_pii', 'disallowed_unit', 'disallowed_agency', 'disallowed_explicit', 'disallowed_innuendo', 'disallowed_excessive_emojis', 'not_unique'];
  errors: any[] = [];

  protected fa = fa;

  constructor(
    private api: UserService,
    private modalService: ModalConfirmService,
    private permissionsService: UserRolePermissionsService,
    private toastService: ToastService
  ) {
    this.roles$ = this.permissionsService.listRoles();

    this.source$ = merge(
      this.refresh$,
      interval(60000)
    ).pipe(
      debounceTime(500),
      tap(() => this.isLoading = true),
      switchMap(() => this.api.list({ ...this.search })),
      tap(r => {
        this.source = r;
        this.isLoading = false;
      }),
      tap(() => this.review()),
    );
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

  async update(model: ApiUser) {
    try {
      await firstValueFrom(this.api.update(model));
    }
    catch (err) {
      this.errors.push(err);
    }
  }


  protected handleAddUsersClick() {
    this.modalService.openComponent({
      content: CreateUsersModalComponent,
      context: {
        onCreated: (response: TryCreateUsersResponse) => {
          this.toastService.showMessage(`Created **${response.users.length}** user${response.users.length == 1 ? "s" : ""}.`);
          this.refresh$.next(true);
        }
      }
    });
  }

  protected async handleSetName(userId: string, name: string, status: string) {
    try {
      await this.api.requestNameChange(userId, { requestedName: name, status });
      this.refresh$.next(true);
      this.toastService.showMessage(`This user's name has been changed **${name}**.${status ? " _(Status: **" + status + "**)_" : ""}`);
    }
    catch (err) {
      this.errors.push(err);
    }
  }
}
