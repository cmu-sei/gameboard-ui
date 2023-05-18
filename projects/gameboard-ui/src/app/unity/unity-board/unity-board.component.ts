import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest, interval, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfigService } from '../../utility/config.service';
import { UnityActiveGame, UnityDeployContext } from '../unity-models';
import { UnityService } from '../unity.service';
import { LayoutService } from '../../utility/layout.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, first, switchMap } from 'rxjs/operators';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-unity-board',
  templateUrl: './unity-board.component.html',
  styleUrls: ['./unity-board.component.scss']
})
export class UnityBoardComponent implements OnInit {
  @Input('gameContext') public ctx!: UnityDeployContext;
  @Output() public gameOver = new EventEmitter();

  errors: string[] = [];
  isProduction = environment.production;
  unityHost: string | null = null;
  unityClientLink: SafeResourceUrl | null = null;
  unityActiveGame: UnityActiveGame | null = null;

  constructor(
    private config: ConfigService,
    private log: LogService,
    private sanitizer: DomSanitizer,
    public unityService: UnityService,
    public layoutService: LayoutService,
    public route: ActivatedRoute,
    private router: Router) { }

  ngOnDestroy(): void {
    this.layoutService.stickyMenu$.next(true);
  }

  ngOnInit(): void {
    // if (!this.config.settings.unityclienthost) {
    //   const errorMessage = `Unity host is not set: ${this.config.settings.unityclienthost}`;
    //   this.handleError(errorMessage);
    // }

    this.unityHost = this.config.settings.unityclienthost || null;
    this.unityService.error$.subscribe(err => this.handleError(err));

    this.layoutService.stickyMenu$.next(false);
    this.unityClientLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.unityHost!);
    this.unityService.activeGame$.subscribe(game => this.unityActiveGame = game);

    this.route.paramMap.pipe(
      first(),
      switchMap(params => {
        return of({
          gameId: params.get("gameId")!,
          teamId: params.get("teamId")!,
          playerId: params.get("playerId")!,
          sessionExpirationTime: new Date(parseInt(params.get("sessionExpirationTime") || "0"))
        }) as Observable<UnityDeployContext>;
      })
    ).subscribe(ctx => {
      this.unityService.startGame(ctx);
    });

    combineLatest([
      interval(1000),
      this.unityService.gameOver$,
    ]).subscribe(([tick, isGameOver]) => {
      if (isGameOver) {
        this.log.logInfo("Game over. What now?");
      }
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      // reload to fix css (?)
      window.location = window.location;
    });
  }

  private handleError(error: string) {
    this.errors.push(error);
  }
}
