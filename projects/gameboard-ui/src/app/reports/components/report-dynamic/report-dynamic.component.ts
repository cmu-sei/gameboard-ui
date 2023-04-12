import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { ReportsService } from '../../../services/reports.service';
import { Report } from '../../reports-models';

@Component({
  selector: 'app-report-dynamic',
  templateUrl: './report-dynamic.component.html',
  styleUrls: ['./report-dynamic.component.scss']
})
export class ReportDynamicComponent implements OnDestroy {
  private reportSlug?: string;

  protected report$: Observable<Report | undefined>;

  constructor(
    private reportsService: ReportsService,
    private route: ActivatedRoute) {
    this.report$ = route.params.pipe(
      switchMap(params => this.reportsService.get(params.reportSlug))
    );
  }

  ngOnDestroy(): void {
  }
}
