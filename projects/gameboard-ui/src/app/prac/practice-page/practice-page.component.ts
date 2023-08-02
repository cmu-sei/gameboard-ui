import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { Search } from '@/api/models';
import { SpecSummary } from '@/api/spec-models';
import { ConfigService } from '@/utility/config.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';
import { RouterService } from '@/services/router.service';
import { PracticeService } from '@/services/practice.service';
import { LocalActiveChallenge } from '@/api/board-models';
import { UserService as LocalUserService } from '@/utility/user.service';
import { UserService } from '@/api/user.service';
import { PlayerMode } from '@/api/player-models';
import { GameboardPerformanceSummaryViewModel } from '@/core/components/gameboard-performance-summary/gameboard-performance-summary.component';
import { LogService } from '@/services/log.service';

@Component({
  selector: 'app-practice-page',
  templateUrl: './practice-page.component.html',
  styleUrls: ['./practice-page.component.scss']
})
export class PracticePageComponent {
  protected appName?: string;
  protected localUserId?: string;

  constructor(
    configService: ConfigService,
    localUser: LocalUserService) {
    this.appName = configService.settings.appname || "Gameboard";
    this.localUserId = localUser.user$.getValue()?.id;
  }
}
