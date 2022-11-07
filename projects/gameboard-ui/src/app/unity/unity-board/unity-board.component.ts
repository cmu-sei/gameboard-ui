import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest, interval, Observable, of } from 'rxjs';
import { ConfigService } from '../../utility/config.service';
import { UnityActiveGame, UnityDeployContext } from '../unity-models';
import { UnityService } from '../unity.service';
import { LayoutService } from '../../utility/layout.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-unity-board',
  templateUrl: './unity-board.component.html',
  styleUrls: ['./unity-board.component.scss']
})
export class UnityBoardComponent implements OnInit, AfterViewInit {
  @Input('gameContext') public ctx!: UnityDeployContext;
  @ViewChild("componentContainer") componentContainer!: ElementRef<HTMLDivElement>;
  @Output() public gameOver = new EventEmitter();

  unityHost: string | null = null;
  unityClientLink: SafeResourceUrl | null = null;
  unityActiveGame: UnityActiveGame | null = null;
  errors: string[] = [];

  constructor (
    private config: ConfigService,
    private sanitizer: DomSanitizer,
    public unityService: UnityService,
    public layoutService: LayoutService,
    public route: ActivatedRoute) { }

  ngOnDestroy(): void {
    this.layoutService.stickyMenu$.next(true);
  }

  ngOnInit(): void {
    if (!this.config.settings.unityclienthost) {
      console.log("Unity host error", this.config.settings);

      const errorMessage = `Unity host is not set: ${this.config.settings.unityclienthost}`;
      this.handleError(errorMessage);
    }

    this.unityHost = this.config.settings.unityclienthost || null;
    this.unityService.error$.subscribe(err => this.handleError(err));

    this.layoutService.stickyMenu$.next(false);
    this.unityClientLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.unityHost!);
    this.unityService.activeGame$.subscribe(game => this.unityActiveGame = game);

    this.route.paramMap.pipe(
      take(1),
      switchMap(params => {
        return of({
          gameId: params.get("gameId")!,
          teamId: params.get("teamId")!,
          playerId: params.get("playerId")!,
          sessionExpirationTime: new Date(Date.parse(params.get("sessionExpirationTime")!))
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
        alert("The game's over! What's supposed to happen now?");
      }
    });
  }

  ngAfterViewInit(): void {
    // TODO: longterm, revisit layout concerns
    console.log("set this", `calc(100vh - ${this.layoutService.getNavHeight()}px)`);
    this.componentContainer.nativeElement.style.minHeight = `calc(100vh - ${this.layoutService.getNavHeight()})`;
    this.componentContainer.nativeElement.style.height = `calc(100vh - ${this.layoutService.getNavHeight()})`;
    console.log("see?", this.componentContainer.nativeElement.style.minHeight);
  }

  private handleError(error: string) {
    this.errors.push(error);
  }
}
