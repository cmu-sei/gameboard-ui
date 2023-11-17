import { Component, OnInit } from '@angular/core';
import { DeployStatus } from '@/api/game-models';
import { SimpleEntity, SimpleSponsor } from '@/api/models';
import { DateTime } from 'luxon';
import { fa } from '@/services/font-awesome.service';
import { AppTitleService } from '@/services/app-title.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Observable, Subject, catchError, combineLatest, filter, firstValueFrom, map, startWith, switchMap, tap, timer } from 'rxjs';
import { ExternalGameService } from '@/services/external-game.service';
import { ActivatedRoute } from '@angular/router';
import { FriendlyDatesService } from '@/services/friendly-dates.service';

export type ExternalGameAdminPlayerStatus = "notConnected" | "notReady" | "ready";

export interface ExternalGameAdminTeam {
  id: string;
  name: string;
  sponsors: SimpleSponsor[];
  deployStatus: DeployStatus;
  players: {
    id: string;
    name: string;
    isManager: boolean;
    sponsor: SimpleSponsor;
    status: ExternalGameAdminPlayerStatus;
    user: SimpleEntity;
  }[],
  challenges: ExternalGameAdminChallenge[]
}

export interface ExternalGameAdminChallenge {
  id?: string;
  challengeCreated: boolean;
  gamespaceDeployed: boolean;
  specId: string;
  startTime?: DateTime;
  endTime?: DateTime;
}

export interface ExternalGameAdminContext {
  game: SimpleEntity;
  overallDeployStatus: DeployStatus;
  specs: SimpleEntity[];
  hasNonStandardSessionWindow: boolean;
  startTime?: DateTime;
  endTime?: DateTime;
  teams: ExternalGameAdminTeam[];
}

@Component({
  selector: 'app-external-game-admin',
  templateUrl: './external-game-admin.component.html',
  styleUrls: ['./external-game-admin.component.scss']
})
export class ExternalGameAdminComponent implements OnInit {
  private gameId: string | null = null;
  private autoUpdateInterval = 30000;
  private forceRefresh$ = new Subject<void>();

  protected ctx$?: Observable<ExternalGameAdminContext>;
  protected context?: ExternalGameAdminContext;
  protected errors: any[] = [];
  protected canDeploy = false;
  protected deployAllTooltip = "";
  protected fa = fa;
  protected sessionDateDescription = "";

  constructor(
    private route: ActivatedRoute,
    private appTitleService: AppTitleService,
    private externalGameService: ExternalGameService,
    private friendlyDates: FriendlyDatesService,
    private unsub: UnsubscriberService) { }

  ngOnInit(): void {
    this.unsub.add(
      combineLatest([
        this.route.paramMap,
        timer(0, this.autoUpdateInterval),
        this.forceRefresh$
      ]).pipe(
        map(([params, tick, _]) => params?.get("gameId")),
        filter(gameId => !!gameId)
      ).subscribe(gameId => this.load(gameId!))
    );

    this.forceRefresh$.next();
  }

  protected async handlePreDeployAllClick(gameId: string) {
    try {
      await firstValueFrom(this.externalGameService.preDeployAll(gameId));
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  protected async handlePlayerReadyStateChanged(playerId: string) {
    this.forceRefresh$.next();
  }

  private load(gameId: string) {
    this.gameId = gameId;
    this.ctx$ = this.externalGameService.getAdminContext(gameId).pipe(
      catchError((err, caught) => {
        this.errors.push(err);
        return caught;
      }),
      tap(ctx => {
        // do some fiddly computations to dealing with them in the template
        this.appTitleService.set(`${ctx.game.name} : External Game`);
        this.canDeploy = ctx.overallDeployStatus == 'notStarted';

        if (ctx.overallDeployStatus == "deploying") {
          this.deployAllTooltip = "Resources are being deployed for this game. Hang tight...";
        }
        else if (ctx.overallDeployStatus == "deployed") {
          this.deployAllTooltip = "All of this game's resources have been deployed.";
        }

        this.sessionDateDescription = "";
        if (ctx.startTime && ctx.endTime) {
          // conver to js dates since our friendly dates service uses those and not luxon (for some godforsaken reason...)
          // ...
          // i'm kidding. it's my fault. i did it.
          const startTime = ctx.startTime.toJSDate();
          const endTime = ctx.endTime.toJSDate();

          // if they have the same day/month year, just show the date once
          if (ctx.startTime.hasSame(ctx.endTime, 'day')) {
            const dateDescription = this.friendlyDates.toFriendlyDate(startTime);
            this.sessionDateDescription = `${dateDescription}, ${this.friendlyDates.toFriendlyTime(startTime)} - ${this.friendlyDates.toFriendlyTime(endTime)}`;
          }
          else {
            this.sessionDateDescription = `${this.friendlyDates.toFriendlyDateAndTime(startTime)} - ${this.friendlyDates.toFriendlyDateAndTime(endTime)}`;
          }
        }

        return ctx;
      })
    );
  }
}
