import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReportMetaData } from '../reports-models';

@Injectable({ providedIn: 'root' })
export class ActiveReportService {
  public htmlElement$ = new BehaviorSubject<ElementRef<HTMLDivElement> | null | undefined>(null);
  public metaData$ = new BehaviorSubject<ReportMetaData | null>(null);
  public parameterResetRequest$ = new Subject<void>();
  public runRequest$ = new Subject<void>();

  private _parametersPristine$ = new BehaviorSubject<boolean>(true);
  public parametersPristine$ = this._parametersPristine$.asObservable();

  public get parametersPristine() { return this._parametersPristine$.value; }
  public set parametersPristine(value: boolean) {
    if (this._parametersPristine$.value !== value) {
      this._parametersPristine$.next(value);
    }
  }
}
