import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Player, TimeWindow } from '../api/player-models';
import { NowService } from './now.service';

export interface SessionHaver {
  session?: TimeWindow;
  sessionBegin?: Date;
  sessionEnd?: Date;
}

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  constructor(private nowService: NowService) { }

  public canUnenroll(player: Player) {
    return this.canUnenrollSession(player.session);
  }

  public canUnenrollSession(session?: TimeWindow) {
    return session ? session.isBefore : true;
  }

  public addSession(sessionHaver: SessionHaver, sessionBegin: Date, sessionEnd: Date) {
    let finalSession: TimeWindow | undefined;

    if (sessionBegin && sessionEnd) {
      // ensure that session values come in as dates (serialization can have them end up as strings from the api side)
      let finalSessionBegin: DateTime;
      if (!DateTime.isDateTime(sessionBegin)) {
        finalSessionBegin = DateTime.fromISO(sessionBegin.toString());
      } else {
        finalSessionBegin = DateTime.fromJSDate(sessionBegin);
      }

      let finalSessionEnd: DateTime;
      if (!DateTime.isDateTime(sessionEnd)) {
        finalSessionEnd = DateTime.fromISO(sessionEnd.toString());
      } else {
        finalSessionEnd = DateTime.fromJSDate(sessionEnd);
      }

      finalSession = new TimeWindow(finalSessionBegin.toJSDate(), finalSessionEnd.toJSDate());
    }

    sessionHaver.session = finalSession;
    sessionHaver.sessionBegin = finalSession?.beginDate;
    sessionHaver.sessionEnd = finalSession?.endDate;
  }

  public getCumulativeTime(session: TimeWindow) {
    const now = this.nowService.now();

    if (session.endDate < now) {
      return session.endDate.valueOf() - session.beginDate.valueOf();
    }

    return now.valueOf() - session.beginDate.valueOf();
  }
}
