import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReportMetaData } from '../reports-models';
import { pipeTapLog } from 'projects/gameboard-ui/src/tools';

@Injectable({ providedIn: 'root' })
export class ActiveReportService {
  public htmlElement$ = new BehaviorSubject<ElementRef<HTMLDivElement> | null | undefined>(null);
  public metaData$ = pipeTapLog(new Subject<ReportMetaData>(), "metadata");
  public parametersChanged$ = pipeTapLog(new Subject<any>(), "parameters changed");
  public runRequest$ = pipeTapLog(new Subject<void>(), "run request");
}
