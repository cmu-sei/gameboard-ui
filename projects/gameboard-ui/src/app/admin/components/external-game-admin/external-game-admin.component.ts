import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { Subject, combineLatest, debounceTime, filter, firstValueFrom, map, timer } from 'rxjs';
import { ExternalGameDeployStatus } from '@/api/game-models';
import { SimpleEntity, SimpleSponsor } from '@/api/models';
import { fa } from '@/services/font-awesome.service';
import { AppTitleService } from '@/services/app-title.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { ExternalGameService } from '@/services/external-game.service';
import { FriendlyDatesService } from '@/services/friendly-dates.service';

export type SyncStartPlayerStatus = "notConnected" | "notReady" | "ready";

export interface ExternalGameAdminTeam {
  id: string;
  name: string;
  sponsors: SimpleSponsor[];
  deployStatus: ExternalGameDeployStatus;
  externalGameHostUrl?: string;
  isReady: boolean;
  players: {
    id: string;
    name: string;
    isCaptain: boolean;
    sponsor: SimpleSponsor;
    status: SyncStartPlayerStatus;
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
  overallDeployStatus: ExternalGameDeployStatus;
  specs: SimpleEntity[];
  hasNonStandardSessionWindow: boolean;
  startTime?: DateTime;
  endTime?: DateTime;
  teams: ExternalGameAdminTeam[];
}

@Component({
    selector: 'app-external-game-admin',
    templateUrl: './external-game-admin.component.html',
    styleUrls: ['./external-game-admin.component.scss'],
    providers: [UnsubscriberService],
    standalone: false
})
export class ExternalGameAdminComponent implements OnInit {
  private gameId?: string;
  private autoUpdateInterval = 30000;
  private forceRefresh$ = new Subject<void>();

  protected ctx?: ExternalGameAdminContext;
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
        // this is just here because server failures makes timer go off
        // like 3x a second
        timer(0, this.autoUpdateInterval).pipe(debounceTime(5000)),
        this.forceRefresh$
      ]).pipe(
        map(([tick, _]) => this.gameId),
        filter(gameId => !!gameId)
      ).subscribe(gameId => this.load(gameId!)),

      // listen for router data
      this.route.data.subscribe(async d => {
        this.gameId = d.gameId;
        this.forceRefresh$.next();
      })
    );
  }

  protected async handlePreDeployAllClick(gameId: string) {
    try {
      this.bindOverallDeployStatus("deploying");
      await firstValueFrom(this.externalGameService.preDeployAll(gameId));
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  protected async handlePreDeployTeamClick(gameId: string, teamId: string) {
    try {
      this.bindOverallDeployStatus("deploying");
      await firstValueFrom(this.externalGameService.preDeployTeams(gameId, teamId));
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }

  protected async handlePlayerReadyStateChanged(playerId: string) {
    this.forceRefresh$.next();
  }

  protected async handleTeamReadyStateChanged(teamId: string) {
    this.forceRefresh$.next();
  }

  private bindOverallDeployStatus(overallDeployStatus: ExternalGameDeployStatus) {
    this.canDeploy = overallDeployStatus == "notStarted" || overallDeployStatus == "partiallyDeployed";

    if (overallDeployStatus == "deploying") {
      this.deployAllTooltip = "Resources are being deployed for this game. Hang tight...";
    }
    else if (overallDeployStatus == "deployed") {
      this.deployAllTooltip = "All of this game's resources have been deployed.";
    }
  }

  private async load(gameId: string) {
    this.errors = [];

    try {
      const ctx = await firstValueFrom(this.externalGameService.getAdminContext(gameId));

      // do some fiddly computations to dealing with them in the template
      this.appTitleService.set(`${ctx.game.name} : External Game`);
      this.bindOverallDeployStatus(ctx.overallDeployStatus);

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

      this.ctx = ctx;
    }
    catch (err: any) {
      this.errors.push;
    }
  }
}
