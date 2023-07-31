import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { NewPlayer } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { SpecSummary } from '../../api/spec-models';
import { ApiUser } from '../../api/user-models';
import { UserService } from '../../utility/user.service';
import { PracticeService } from '@/services/practice.service';
import { UserChallengeSlim } from '@/api/board-models';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
  selector: 'app-practice-session',
  templateUrl: './practice-session.component.html',
})
export class PracticeSessionComponent implements OnInit {
  errors: Error[] = [];
  spec$: Observable<SpecSummary>;
  user$: Observable<ApiUser | null>;
  unauthed = true;
  activeOtherChallenge?: UserChallengeSlim;

  private _specId?: string;

  constructor(
    route: ActivatedRoute,
    private modalService: ModalConfirmService,
    private userSvc: UserService,
    private router: Router,
    private api: PlayerService,
    private practiceService: PracticeService,
  ) {
    this.spec$ = route.params.pipe(
      filter(p => !!p.cid),
      switchMap(p => practiceService.searchChallenges({ term: p.cid })),
      map(r => !r.results.items.length ? ({ name: "Not Found" } as SpecSummary) : r.results.items[0]),
      tap(s => this._specId = s.id)
    );

    this.user$ = userSvc.user$.pipe(
      tap(u => this.unauthed = !u)
    );
  }

  async ngOnInit(): Promise<void> {
    if (this.userSvc.user$.value?.id) {
      const activePracticeChallenge = await firstValueFrom(this.practiceService.getActivePracticeChallenge(this.userSvc.user$.value.id));

      if (activePracticeChallenge) {
        if (this._specId && activePracticeChallenge?.specId === this._specId) {
          this.router.navigate(["../game/board", activePracticeChallenge.player.id, activePracticeChallenge.challenge.id]);
        } else {
          this.activeOtherChallenge = activePracticeChallenge;
        }
      }
    }
  }

  play(s: SpecSummary): void {
    const userId = this.userSvc.user$.value?.id;

    if (!userId) {
      throw new Error("Can't start a practice challenge while not authenticated.");
    }

    this.api.create({ userId: userId, gameId: s.gameId } as NewPlayer).pipe(
      first()
    ).subscribe(p =>
      this.router.navigate(["../game/board", p.id, s.id])
    );
  }

  handleStartNewChallengeClick(spec: SpecSummary, otherChallenge: UserChallengeSlim) {
    this.modalService.openConfirm({
      title: `Start a new practice challenge?`,
      bodyContent: `If you continue, you'll end your session for practice challenge **${otherChallenge.challenge.name}** and start a new one for this challenge (**${spec.name}**). Are you sure that's what you want to do?`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        if (!this.activeOtherChallenge) {
          throw new Error("Can't end previous challenge and start a new one - no previous challenge detected.");
        }

        await this.practiceService.endPracticeChallenge(this.activeOtherChallenge.teamId);
        this.play(spec);
      }
    });
  }
}
