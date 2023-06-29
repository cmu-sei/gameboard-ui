import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { NewPlayer } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { SpecSummary } from '../../api/spec-models';
import { ApiUser } from '../../api/user-models';
import { UserService } from '../../utility/user.service';
import { PracticeService } from '@/services/practice.service';

@Component({
  selector: 'app-practice-session',
  templateUrl: './practice-session.component.html',
  styleUrls: ['./practice-session.component.scss']
})
export class PracticeSessionComponent {
  errors: Error[] = [];
  spec$: Observable<SpecSummary>;
  user$: Observable<ApiUser | null>;
  unauthed = true;

  constructor(
    route: ActivatedRoute,
    practiceService: PracticeService,
    userSvc: UserService,
    private router: Router,
    private api: PlayerService
  ) {
    this.spec$ = route.params.pipe(
      filter(p => !!p.cid),
      switchMap(p => practiceService.searchChallenges({ term: p.cid })),
      map(r => !r.results.items.length ? ({ name: "Not Found" } as SpecSummary) : r.results.items[0])
    );

    this.user$ = userSvc.user$.pipe(
      tap(u => this.unauthed = !u)
    );
  }

  play(u: ApiUser, s: SpecSummary): void {
    const model = { userId: u.id, gameId: s.gameId } as NewPlayer;
    this.api.create(model).pipe(
      first()
    ).subscribe(p =>
      this.router.navigate(["../game/board", p.id, s.id])
    );
  }
}
