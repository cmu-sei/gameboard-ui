import { Injectable } from '@angular/core';
import {
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, from, map, of } from 'rxjs';
import { ReportsService } from '../reports.service';

@Injectable({ providedIn: 'root' })
export class ReportsTitleResolver {
  constructor(private reportsService: ReportsService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> {
    return from(this.reportsService.get(route.params['reportKey']))
      .pipe(map(report => `${report?.name + ' Report' || 'Report'}`));
  }
}
