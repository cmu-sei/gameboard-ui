// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { faCopy, faEdit, faPaste, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { Observable, of, Subject, Subscription, timer } from 'rxjs';
import { finalize, map, tap, delay, first } from 'rxjs/operators';
import { GameContext } from '../../api/game-models';
import { HubPlayer, NewPlayer, Player, PlayerEnlistment, PlayerRole, TeamInvitation, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ConfigService } from '../../utility/config.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../utility/user.service';

@Component({
  selector: 'app-player-enroll',
  templateUrl: './player-enroll.component.html',
  styleUrls: ['./player-enroll.component.scss']
})
export class PlayerEnrollComponent implements OnInit, OnDestroy {
  @Input() ctx!: GameContext;
  @Output() onEnroll = new EventEmitter<Player>();
  @Output() onUnenroll = new EventEmitter<Player>();

  errors: any[] = [];
  code = '';
  invitation = '';
  token = '';
  delayMs = 2000;

  ctx$: Observable<GameContext>;
  ctxDelayed$: Observable<GameContext>;

  disallowedName: string | null = null;
  disallowedReason: string | null = null;
  protected managerRole = PlayerRole.manager;
  protected isManager$ = new Subject<boolean>();
  protected hasTeammates$: Observable<boolean> = of(false);
  protected unenrollTooltip?: string;
  private hubSub?: Subscription;

  faUser = faUser;
  faEdit = faEdit;
  faCopy = faCopy;
  faPaste = faPaste;
  faTrash = faTrash;

  constructor(
    private api: PlayerService,
    private config: ConfigService,
    private hubService: NotificationService,
    private localUser: UserService
  ) {
    this.ctx$ = timer(0, 1000).pipe(
      map(i => this.ctx),
      tap(ctx => {
        ctx.player.session = new TimeWindow(ctx.player?.sessionBegin, ctx.player?.sessionEnd);
        ctx.game.session = new TimeWindow(ctx.game?.gameStart, ctx.game?.gameEnd);
        ctx.game.registration = new TimeWindow(ctx.game?.registrationOpen, ctx.game?.registrationClose);
      }),
      tap((gc) => {
        if (gc.player.nameStatus && gc.player.nameStatus != 'pending') {
          if (this.disallowedName == null) {
            this.disallowedName = gc.player.name;
            this.disallowedReason = gc.player.nameStatus;
          }
        }
      })
    );

    // Delay needed to prevent an enroll refresh error; 2 seconds should be enough
    this.ctxDelayed$ = this.ctx$.pipe(
      delay(this.delayMs)
    );

    this.hasTeammates$ = this.hubService.actors$.pipe(map(actors => actors.length > 1));
  }

  ngOnInit(): void {
    this.manageUnenrollAvailability(this.hubService.actors$.getValue());
    this.isManager$.next(this.ctx.player.isManager);
    this.hubSub = this.hubService.actors$.subscribe(a => {
      this.manageUnenrollAvailability(a);

      const manager = a.find(a => a.isManager);
      if (manager)
        this.isManager$.next(manager?.id == this.ctx.player.id);
    });
  }

  async invite(p: Player) {
    this.code = ""
    this.invitation = "";

    this.api.invite(p.id).pipe(first())
      .subscribe((m: TeamInvitation) => {
        this.code = m.code;
        this.invitation = `${this.config.absoluteUrl}game/teamup/${m.code}`;
      });
  }

  redeem(p: Player): void {
    const model = {
      playerId: p.id,
      code: this.token.split('/').pop()
    } as PlayerEnlistment;

    const sub: Subscription = this.api.enlist(model).pipe(
      tap(p => this.token = ''),
      finalize(() => sub.unsubscribe())
    ).subscribe(
      p => this.enrolled(p),
      err => this.errors.push(err)
    );
  }

  update(p: Player): void {
    if (!p.name.trim()) {
      p.name = '';
      return;
    }

    // If the user's name isn't the disallowed one, mark it as pending
    if (p.name != this.disallowedName) p.nameStatus = "pending";
    // Otherwise, if there is a disallowed reason as well, mark it as that reason
    else if (this.disallowedReason) p.nameStatus = this.disallowedReason;

    this.api.update(p).pipe(first()).subscribe(
      p => this.api.transform(p)
    );
  }

  protected handleEnroll(userId: string, gameId: string): void {
    const model = { userId, gameId } as NewPlayer;
    this.api.create(model).pipe(first()).subscribe(p => {
      this.enrolled(p);
    });
  }

  protected handleUnenroll(p: Player): void {
    this.api.unenroll(p.id).pipe(first()).subscribe(_ => {
      this.onUnenroll.emit(p);
    });
  }

  private enrolled(p: Player): void {
    this.onEnroll.emit(p);
  }

  private manageUnenrollAvailability(actors: HubPlayer[]) {
    // you can unenroll if you're the only one left
    if (!actors.length || actors.length == 1 && actors[0].userId === this.ctx.user.id) {
      this.setCanUnenroll(true);
      return;
    }

    // you can unenroll if you're not the manager
    const managerPlayer = actors.find(a => a.isManager)!.id;
    if (managerPlayer !== this.ctx.player.id) {
      this.setCanUnenroll(true);
      return;
    }

    // otherwise, verify that this person is the manager and then tell them about
    // the rules of succession
    this.setCanUnenroll(false)

    return;
  }

  private setCanUnenroll(canUnenroll: boolean): void {
    if (!canUnenroll) {
      this.unenrollTooltip = `
        You're the team manager, so you can't unenroll until you promote someone else to the role of manager.
        If you'd like to unenroll, use the "Promote" buttons next to the player names on the "Status" card to choose
        a new manager.`;
    } else {
      this.unenrollTooltip = undefined;
    }
  }

  ngOnDestroy(): void {
    this.hubSub?.unsubscribe();
  }
}
