import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, Observer, Subject, debounceTime, filter, firstValueFrom, switchMap, tap } from 'rxjs';
import { fa } from "@/services/font-awesome.service";
import { TeamService } from '@/api/team.service';
import { ApiUser } from '@/api/user-models';
import { UserService } from '@/api/user.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { AdminEnrollTeamResponse } from '@/api/teams.models';

@Component({
  selector: 'app-admin-enroll-team-modal',
  templateUrl: './admin-enroll-team-modal.component.html',
  styleUrls: ['./admin-enroll-team-modal.component.scss']
})
export class AdminEnrollTeamModalComponent implements OnInit {
  @ViewChild("searchBox") searchBoxRef?: ElementRef<HTMLInputElement>;

  game?: {
    id: string;
    name: string;
    minTeamSize: number;
    maxTeamSize?: number;
  };
  onConfirm?: (createdTeam: AdminEnrollTeamResponse) => Promise<void> | void;

  private _search$ = new Subject<string>();

  protected canAddAsTeam = false;
  protected errors: any[] = [];
  protected fa = fa;
  protected isTeamGame = false;
  protected isWorking = false;
  protected searchTerm = "";
  protected selectedUsers: ApiUser[] = [];
  protected typeaheadSearch$ = new Observable((observer: Observer<string | undefined>) => observer.next(this.searchTerm)).pipe(
    filter(s => s?.length >= 3),
    switchMap(search => this.userService.list({
      eligibleForGameId: this.game!.id,
      excludeIds: [...this.selectedUsers.map(u => u.id)],
      term: search,
    })),
  );

  constructor(
    private modalConfirmService: ModalConfirmService,
    private teamService: TeamService,
    private userService: UserService) { }

  ngOnInit(): void {
    if (!this.game)
      throw new Error("Can't resolve the game.");

    this.isTeamGame = !this.game.maxTeamSize || this.game.maxTeamSize >= 2;
  }

  protected close() {
    this.modalConfirmService.hide();
  }

  protected async handleAddClick() {
    this.errors = [];
    if (!this.game?.id)
      return;

    if (!this.selectedUsers.length)
      return;

    try {
      const userIds = this.selectedUsers.map(u => u.id);
      const result = await firstValueFrom(this.teamService.adminEnroll({ userIds, gameId: this.game.id }));

      if (this.onConfirm)
        await this.onConfirm(result);

      this.modalConfirmService.hide();
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  protected handleTypeaheadSelect(apiUserResult: TypeaheadMatch) {
    if (!this.selectedUsers.some(u => u.id === apiUserResult.item.id)) {
      this.selectedUsers.push(apiUserResult.item);
      this.selectedUsers.sort((a, b) => a.approvedName.localeCompare(b.approvedName));
    }

    this.searchTerm = "";
  }

  protected search(input: string) {
    this._search$.next(input.length >= 3 ? input : "");
  }
}
