import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Player, TimeWindow } from '../api/player-models';

export interface SessionHaver {
  session?: TimeWindow;
  sessionBegin?: Date;
  sessionEnd?: Date;
}

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  canUnenroll(player: Player) {
    return this.canUnenrollSession(player.session);
  }

  canUnenrollSession(session?: TimeWindow) {
    return !session ? true : session.isBefore;
  }

  public transformSession(sessionHaver: SessionHaver, sessionBegin: Date, sessionEnd: Date) {
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

    this.addSession(sessionHaver, finalSession);
  }

  public addSession(sessionHaver: SessionHaver, session?: TimeWindow) {
    sessionHaver.session = session;
    sessionHaver.sessionBegin = session?.beginDate;
    sessionHaver.sessionEnd = session?.endDate;
  }

  public getCumulativeTime(session: TimeWindow) {
    if (session.isAfter) {
      return session.endDate.valueOf() - session.beginDate.valueOf();
    }

    return new Date().valueOf() - session.beginDate.valueOf();
  }
}
