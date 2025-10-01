// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeaheadMatch, TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { debounceTime, filter, Observable, Observer, switchMap } from 'rxjs';
import { CoreModule } from '@/core/core.module';
import { fa } from "@/services/font-awesome.service";
import { UserService } from '@/api/user.service';
import { ApiUser } from '@/api/user-models';

@Component({
    selector: 'app-user-picker',
    imports: [
        CommonModule,
        TypeaheadModule,
        CoreModule,
    ],
    templateUrl: './user-picker.component.html',
    styleUrls: ['./user-picker.component.scss']
})
export class UserPickerComponent {
  @Input() eligibleForGameId?: string;
  @Input() excludeUserIds: string[] = [];
  @Output() select = new EventEmitter<ApiUser>();

  protected fa = fa;
  protected searchTerm = "";

  private userService = inject(UserService);

  protected typeaheadSearch$ = new Observable((observer: Observer<string | undefined>) => observer.next(this.searchTerm)).pipe(
    filter(s => s?.length >= 2),
    debounceTime(300),
    switchMap(search => this.userService.list({
      eligibleForGameId: this.eligibleForGameId,
      excludeIds: this.excludeUserIds,
      term: search,
    })),
  );

  protected handleTypeaheadSelect(apiUserResult: TypeaheadMatch) {
    this.select.emit(apiUserResult.item);
    this.searchTerm = "";
  }
}
