// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, of, Subscription, timer } from 'rxjs';
import { map, tap, delay, first } from 'rxjs/operators';
import { GameContext } from '../../api/models';
import { HubPlayer, NewPlayer, Player, PlayerEnlistment, PlayerRole, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ConfigService } from '../../utility/config.service';
import { NotificationService } from '../../services/notification.service';
import { UserService as LocalUserService } from '../../utility/user.service';
import { fa } from '@/services/font-awesome.service';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';
import { GameRegistrationType } from '@/api/game-models';
import { UserRolePermissionsService } from '@/api/user-role-permissions.service';

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
  isEnrolling = false;
  token = '';
  delayMs = 2000;

  ctx$: Observable<GameContext>;
  ctxDelayed$: Observable<GameContext>;

  protected canAdminEnroll = false;
  protected canStandardEnroll = false;
  protected disallowedName: string | null = null;
  protected disallowedReason: string | null = null;
  protected enrollTooltip = "";
  protected hasSelectedSponsor = false;
  protected managerRole = PlayerRole.manager;
  protected isEnrolled$: Observable<boolean>;
  protected isManager$ = new BehaviorSubject<boolean | null>(null);
  protected isRegistrationOpen = false;
  protected hasTeammates$: Observable<boolean> = of(false);
  protected unenrollTooltip?: string;
  private hubSub?: Subscription;

  fa = fa;

  constructor(
    private api: PlayerService,
    private config: ConfigService,
    private clipboard: ClipboardService,
    private hubService: NotificationService,
    private localUserService: LocalUserService,
    private permissionsService: UserRolePermissionsService,
    private toastService: ToastService
  ) {
    this.ctx$ = timer(0, 1000).pipe(
      map(i => this.ctx),
      tap(ctx => {
        ctx.player.session = new TimeWindow(ctx.player?.sessionBegin, ctx.player?.sessionEnd);
        ctx.game.session = new TimeWindow(ctx.game?.gameStart, ctx.game?.gameEnd);
        ctx.game.registration = new TimeWindow(ctx.game?.registrationOpen, ctx.game?.registrationClose);
        this.isRegistrationOpen = ctx.game.registrationType !== GameRegistrationType.none;
        this.enrollTooltip = this.isRegistrationOpen ? "" : "Registration is currently closed for this game.";

        if (this.isManager$.value === null) {
          this.isManager$.next(ctx.player?.isManager || true);
        }
      }),
      tap((gc) => {
        if (gc.player.nameStatus && gc.player.nameStatus != 'pending') {
          if (this.disallowedName == null) {
            this.disallowedName = gc.player.name;
            this.disallowedReason = gc.player.nameStatus;
          }
        }
      }),
      tap(ctx => {
        const localUser = this.localUserService.user$.value;
        const hasPlayerSession = (!!ctx.player.id && !!ctx.player.session && !ctx.player.session.isBefore);
        this.canAdminEnroll = !!this.permissionsService.can('Play_IgnoreExecutionWindow') && !hasPlayerSession;

        this.canStandardEnroll = !!localUser && !hasPlayerSession &&
          ctx.game.registrationType != "none" &&
          ctx.game.registration.isDuring && (
            !ctx.player.id ||
            !ctx.player.session ||
            ctx.player.session?.isBefore
          );

        this.hasSelectedSponsor = !!ctx.user.sponsor?.id && !ctx.user.hasDefaultSponsor;
      })
    );

    // Delay needed to prevent an enroll refresh error; 2 seconds should be enough
    this.ctxDelayed$ = this.ctx$.pipe(
      delay(this.delayMs)
    );

    this.isEnrolled$ = this.ctx$.pipe(map(ctx => !!ctx.player.id));
    this.hasTeammates$ = this.hubService.actors$.pipe(map(actors => actors.length > 1));
  }

  ngOnInit(): void {
    this.manageUnenrollAvailability(this.hubService.actors$.getValue());
    this.hubSub = this.hubService.actors$.subscribe(a => {
      this.manageUnenrollAvailability(a);

      const manager = a.find(a => a.isManager);
      if (this.ctx.player?.id && manager) {
        this.isManager$.next(manager.id == this.ctx.player.id);
      }
    });
  }

  async invite(p: Player) {
    this.code = "";
    this.invitation = "";

    const invitation = await firstValueFrom(this.api.invite(p.id));
    this.code = invitation.code;
    this.clipboard.copy(invitation.code);
    this.toastService.showMessage(`Copied invitation code **${invitation.code}** to your clipboard.`);
    this.invitation = `${this.config.absoluteUrl}game/teamup/${invitation.code}`;
  }

  async redeem(p: Player): Promise<void> {
    const model = {
      playerId: p.id,
      code: this.token.split('/').pop()
    } as PlayerEnlistment;

    try {
      const enlistedPlayer = await firstValueFrom(this.api.enlist(model));
      this.token = "";
      this.enrolled(enlistedPlayer);
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  update(p: Player): void {
    if (!p.name.trim()) {
      p.name = '';
      return;
    }

    // Otherwise, if there is a disallowed reason as well, mark it as that reason
    if (this.disallowedReason) p.nameStatus = this.disallowedReason;

    this.api.update(p).pipe(first()).subscribe(
      p => this.api.transform(p)
    );

    this.ctx.player = {
      ...this.ctx.player,
      name: p.name,
      nameStatus: p.nameStatus,
      approvedName: p.approvedName
    };
  }

  protected async handleEnroll(userId: string, gameId: string): Promise<void> {
    const model = { userId, gameId } as NewPlayer;
    this.isEnrolling = true;
    this.errors = [];

    try {
      const player = await firstValueFrom(this.api.create(model));
      this.enrolled(player);
    }
    catch (err) {
      this.errors.push(err);
    }

    this.isEnrolling = false;
  }

  protected async handleUnenroll(p: Player): Promise<void> {
    this.errors = [];

    try {
      this.isEnrolling = true;
      await firstValueFrom(this.api.unenroll(p.id));
      this.isEnrolling = false;
      this.onUnenroll.emit(p);
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  private enrolled(p: Player): void {
    this.isEnrolling = false;
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
    this.setCanUnenroll(false);

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
