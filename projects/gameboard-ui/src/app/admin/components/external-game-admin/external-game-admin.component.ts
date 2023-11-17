import { Component, OnInit } from '@angular/core';
import { DeployStatus } from '@/api/game-models';
import { SimpleEntity, SimpleSponsor } from '@/api/models';
import { DateTime } from 'luxon';
import { AppTitleService } from '@/services/app-title.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { Observable, catchError, firstValueFrom, switchMap, tap, timer } from 'rxjs';
import { ExternalGameService } from '@/services/external-game.service';
import { ActivatedRoute } from '@angular/router';

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

  protected ctx$?: Observable<ExternalGameAdminContext>;
  protected context?: ExternalGameAdminContext;
  protected errors: any[] = [];
  protected canDeploy = false;
  protected deployAllTooltip = "";

  constructor(
    private route: ActivatedRoute,
    private appTitleService: AppTitleService,
    private externalGameService: ExternalGameService,
    private unsub: UnsubscriberService) { }

  ngOnInit(): void {
    this.unsub.add(
      this.route.paramMap.subscribe(params => {
        const gameIdParam = params.get("gameId");

        if (gameIdParam && this.gameId != gameIdParam) {
          this.gameId = gameIdParam;
          this.ctx$ = timer(0, this.autoUpdateInterval).pipe(
            switchMap(() => this.externalGameService.getAdminContext(gameIdParam)),
            catchError((err, caught) => {
              this.errors.push(err);
              return caught;
            }),
            tap(ctx => {
              this.appTitleService.set(`${ctx.game.name} : External Game`);
              this.canDeploy = ctx.overallDeployStatus == 'notStarted';

              if (ctx.overallDeployStatus == "deploying") {
                this.deployAllTooltip = "Resources are being deployed for this game. Hang tight...";
              }
              else if (ctx.overallDeployStatus == "deployed") {
                this.deployAllTooltip = "All of this game's resources have been deployed.";
              }
            })
          );
        }
      })
    );
  }

  protected async handlePreDeployAllClick(gameId: string) {
    try {
      await firstValueFrom(this.externalGameService.preDeployAll(gameId));
    }
    catch (err: any) {
      this.errors.push(err);
    }
  }
}
