import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { zip } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { NewPlayer } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { UserService } from '../../utility/user.service';

@Component({
  selector: 'app-practice-session',
  templateUrl: './practice-session.component.html',
  styleUrls: ['./practice-session.component.scss']
})
export class PracticeSessionComponent {
  errors: Error[] = [];
  cid = '';

  constructor(
    route: ActivatedRoute,
    router: Router,
    api: PlayerService,
    userSvc: UserService
  ){
    zip(route.params, userSvc.user$).pipe(
      tap(([p, u]) => this.cid = p.cid || ""),
      map(([p, u]) => ({userId: u?.id, gameId: p.gid} as NewPlayer)),
      filter(m => !!m.userId && !!m.gameId),
      switchMap(m => api.create(m))
    ).subscribe({
      next: (p) => router.navigate(["../game/board", p.id, this.cid]),
      error: (e) => this.errors.push(e)
    });
  }
}
