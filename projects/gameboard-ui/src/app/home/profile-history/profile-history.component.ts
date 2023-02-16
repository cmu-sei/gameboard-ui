import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { UserService } from '../../utility/user.service';

@Component({
  selector: 'app-profile-history',
  templateUrl: './profile-history.component.html',
  styleUrls: ['./profile-history.component.scss']
})
export class ProfileHistoryComponent {
  list$: Observable<Player[]>;

  constructor(
    userSvc: UserService,
    api: PlayerService
  ){
    this.list$ = userSvc.user$.pipe(
      map(u => u?.id),
      filter(id => !!id),
      switchMap(uid => api.list({uid, sort:'time'}))
    );
  }
}
