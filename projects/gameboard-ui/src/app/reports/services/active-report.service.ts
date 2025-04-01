import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReportKey, ReportMetaData } from '../reports-models';

@Injectable({ providedIn: 'root' })
export class ActiveReportService {
  public generateRequested$ = new Subject<void>();
  public metaData$ = new BehaviorSubject<ReportMetaData | null>(null);
  public parametersReset$ = new Subject<void>();
}
