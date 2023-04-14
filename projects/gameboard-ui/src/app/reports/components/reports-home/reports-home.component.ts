import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportsService } from '../../reports.service';
import { Report } from '../../reports-models';

@Component({
  selector: 'app-reports-home',
  templateUrl: './reports-home.component.html',
  styleUrls: ['./reports-home.component.scss']
})
export class ReportsHomeComponent implements OnInit {
  reports$?: Observable<Report[]>;

  constructor(private reportsService: ReportsService) { }

  ngOnInit(): void {
    this.reports$ = this.reportsService.list();
  }
}
