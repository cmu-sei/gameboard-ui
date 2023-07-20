import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReportMetaData } from '../reports-models';

@Injectable({ providedIn: 'root' })
export class ActiveReportService {
  public htmlElement$ = new BehaviorSubject<ElementRef<HTMLDivElement> | null | undefined>(null);
  public metaData$ = new BehaviorSubject<ReportMetaData | null>(null);
  public parameterResetRequest$ = new Subject<void>();
}
