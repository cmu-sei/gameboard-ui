import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { NewPlayer } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { SpecSummary } from '../../api/spec-models';
import { UserService as LocalUserService } from '@/utility/user.service';
import { PracticeService } from '@/services/practice.service';
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { ChallengesService } from '@/api/challenges.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { LogService } from '@/services/log.service';
import { LocalActiveChallenge } from '@/api/challenges.models';

@Component({
  selector: 'app-practice-session',
  templateUrl: './practice-session.component.html',
})
export class PracticeSessionComponent {
  errors: Error[] = [];
  spec$: Observable<SpecSummary>;
  authed$: Observable<boolean>;
  activeChallenge: LocalActiveChallenge | null = null;

  private _specId?: string;
  protected isPlayingOtherChallenge = false;
  protected isStartingSession = false;

  constructor(
    route: ActivatedRoute,
    private challengesService: ChallengesService,
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
      tap(s => this._specId = s.id)
    );

    this.authed$ = localUser.user$.pipe(
      tap(u => {
        if (u) {
          this.resolveActiveChallenge(u.id);
        }
      }),
      map(u => !!u),
    );
  }

  async play(s: SpecSummary): Promise<void> {
    const userId = this.localUser.user$.value?.id;

    if (!userId) {
      throw new Error("Can't start a practice challenge while not authenticated.");
    }

    const player = await firstValueFrom(this.playerService.create({ userId: userId, gameId: s.gameId } as NewPlayer));
    await firstValueFrom(this.challengesService.startPlaying({ specId: s.id, playerId: player.id }));
    this.resolveActiveChallenge(userId);
  }

  handleStartNewChallengeClick(spec: SpecSummary, otherChallenge: LocalActiveChallenge) {
    this.modalService.openConfirm({
      title: `Start a new practice challenge?`,
      bodyContent: `If you continue, you'll end your session for practice challenge **${otherChallenge.challengeSpec.name}** and start a new one for this challenge (**${spec.name}**). Are you sure that's what you want to do?`,
      renderBodyAsMarkdown: true,
      onConfirm: async () => {
        if (!this.activeChallenge) {
          throw new Error("Can't end previous challenge and start a new one - no previous challenge detected.");
        }

        await this.practiceService.endPracticeChallenge(this.activeChallenge.teamId);
        this.play(spec);
      }
    });
  }

  private async resolveActiveChallenge(userId: string): Promise<void> {
    const activeChallenges = await firstValueFrom(this.challengesService.getActiveChallenges(userId));

    if (activeChallenges.practice.length) {
      this.activeChallenge = activeChallenges.practice[0];
    }

    this.isPlayingOtherChallenge = !!this._specId && !!this.activeChallenge && (this.activeChallenge.challengeSpec.id !== this._specId!);
  }
}
