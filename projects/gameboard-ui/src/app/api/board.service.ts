// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameSessionService } from '../services/game-session.service';
import { ConfigService } from '../utility/config.service';
import { BoardPlayer, BoardSpec, Challenge, ChallengeResult, ChallengeSummary, ChangedChallenge, ConsoleActor, NewChallenge, ObserveChallenge, VmConsole } from './board-models';
import { NowService } from '@/services/now.service';

@Injectable({ providedIn: 'root' })
export class BoardService {
  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private gameSessionService: GameSessionService,
    private nowService: NowService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(filter: any = ''): Observable<ChallengeSummary[]> {
    return this.http.get<ChallengeSummary[]>(this.url + '/challenges', { params: filter });
  }

  public archived(filter: any): Observable<ChallengeSummary[]> {
    return this.http.get<ChallengeSummary[]>(this.url + '/challenges/archived', { params: filter });
  }

  public load(id: string): Observable<BoardPlayer> {
    return this.http.get<BoardPlayer>(`${this.url}/board/${id}`).pipe(
      map(b => this.transform(b))
    );
  }

  public preview(model: NewChallenge): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.url}/challenge/preview`, model);
  }

  public launch(model: NewChallenge): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.url}/challenge/launch`, model);
  }

  public deployResources(model: ChangedChallenge): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.url}/challenge/start`, model);
  }

  public undeployResources(model: ChangedChallenge): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.url}/challenge/stop`, model);
  }

  public console(model: VmConsole): Observable<VmConsole> {
    return this.http.put<VmConsole>(`${this.url}/challenge/console`, model);
  }

  public audit(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/challenge/${id}/audit`);
  }

  public consoles(gid: string): Observable<ObserveChallenge[]> {
    return this.http.get<ObserveChallenge[]>(`${this.url}/challenge/consoles`, { params: { gid } });
  }

  public consoleActors(gid: string): Observable<ConsoleActor[]> {
    return this.http.get<ConsoleActor[]>(`${this.url}/challenge/consoleactors`, { params: { gid } });
  }

  private transform(b: BoardPlayer): BoardPlayer {
    b.game.mapUrl = b.game.background
      ? `${this.config.imagehost}/${b.game.background}`
      : `${this.config.basehref}assets/map.png`
      ;

    b.game.cardUrl = b.game.logo
      ? `${this.config.imagehost}/${b.game.logo}`
      : `${this.config.basehref}assets/card.png`
      ;

    b.game.specs.forEach(c => this.checkPrereq(c, b));

    b.game.specs.forEach(s => {
      s.instance = b.challenges.find(c => c.specId == s.id);
      this.setColor(s);
    });

    this.gameSessionService.addSession(b, b.sessionBegin, b.sessionEnd);

    return b;
  }

  getChallengeColor(challengeInfo: { id: string, endTime?: Date, isDisabled: boolean, isLocked: boolean, result: ChallengeResult }) {
    if (!challengeInfo.endTime) {
      return "white";
    }

    if (challengeInfo.isDisabled || challengeInfo.isLocked) {
      return "black";
    }

    if (challengeInfo.result == "success") {
      return "lime";
    }

    if (challengeInfo.result == "partial") {
      return "yellow";
    }

    if (challengeInfo.endTime < this.nowService.now())
      return "red";

    return "blue";
  }

  setColor(s: BoardSpec): void {
    s.c = !!s.instance?.state.id
      ? s.instance.state.endTime.match(/^0001/) ? 'white' : 'black'
      : s.disabled || s.locked ? 'black' : 'blue'
      ;
    if (!!s.instance) {
      if (s.instance.result === "success") { s.c = 'lime'; }
      if (s.instance.result === "partial") { s.c = 'yellow'; }
    }
  }

  checkPrereq(spec: BoardSpec, board: BoardPlayer) {
    const p = board.game.prerequisites.filter(f => f.targetId === spec.id);
    let unlocked = true;
    p.forEach(f => {
      unlocked = unlocked && (board.challenges.find(d => d.specId === f.requiredId)?.score || 0) >= f.requiredScore;
    });
    spec.locked = !unlocked;
    spec.lockedText = spec.locked ? 'Locked' : spec.disabled ? 'Disabled' : '';
  }
}
