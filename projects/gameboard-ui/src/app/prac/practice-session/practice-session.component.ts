import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { NewPlayer } from '@/api/player-models';
import { PlayerService } from '@/api/player.service';
import { SpecSummary } from '@/api/spec-models';
import { UserService as LocalUserService } from '@/utility/user.service';
import { PracticeService } from '@/services/practice.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { LocalActiveChallenge } from '@/api/challenges.models';
import { ActiveChallengesRepo } from '@/stores/active-challenges.store';
import { PlayerContext } from '@/game/components/play/play.component';

@Component({
  selector: 'app-practice-session',
  templateUrl: './practice-session.component.html',
})
export class PracticeSessionComponent {
  spec$: Observable<SpecSummary>;
  authed$: Observable<boolean>;
  activePracticeChallenge$ = new BehaviorSubject<LocalActiveChallenge | null>(null);

  protected playerContext: PlayerContext | null = null;
  protected isPlayingOtherChallenge = false;
  protected isStartingSession = false;

  constructor(
    route: ActivatedRoute,
    private activeChallengesRepo: ActiveChallengesRepo,
    private modalService: ModalConfirmService,
    private localUser: LocalUserService,
    private playerService: PlayerService,
    private practiceService: PracticeService,
    private unsub: UnsubscriberService
  ) {
    this.spec$ = route.params.pipe(
      filter(p => !!p.cid),
      switchMap(p => practiceService.searchChallenges({ term: p.cid })),
      map(r => !r.results.items.length ? ({ name: "Not Found" } as SpecSummary) : r.results.items[0]),
    );

    this.authed$ = localUser.user$.pipe(map(u => !!u));

    this.unsub.add(
      this.activeChallengesRepo.activePracticeChallenge$
        .pipe(tap(c => {
          if (c)
            this.playerContext = {
              playerId: c.player.id,
              userId: c.user.id
            };
        }))
        .subscribe(activeChallenge => this.activePracticeChallenge$.next(activeChallenge))
    );
  }

  async play(s: SpecSummary): Promise<void> {
    const userId = this.localUser.user$.value?.id;

    if (!userId) {
      throw new Error("Can't start a practice challenge while not authenticated.");
    }

    this.isStartingSession = true;
    const player = await firstValueFrom(this.playerService.create({ userId: userId, gameId: s.gameId } as NewPlayer));
    this.playerContext = { playerId: player.id, userId: player.userId }
    this.isStartingSession = false;
  }

  handleStartNewChallengeClick(spec: SpecSummary) {
    const currentPracticeChallenge = this.activePracticeChallenge$.value;
    if (!currentPracticeChallenge) {
      throw new Error("Can't end previous challenge and start a new one - no previous challenge detected.");
    }

    this.modalService.openConfirm({
      title: `Start a new practice challenge?`,
      bodyContent: `If you continue, you'll end your session for practice challenge **${currentPracticeChallenge.spec.name}** and start a new one for this challenge (**${spec.name}**). Are you sure that's what you want to do?`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {

        await this.practiceService.endPracticeChallenge(currentPracticeChallenge.teamId);
        this.play(spec);
      }
    });
  }
}
