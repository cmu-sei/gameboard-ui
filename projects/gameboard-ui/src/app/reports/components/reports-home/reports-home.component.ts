import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../reports.service';
import { Report } from '../../reports-models';

@Component({
  selector: 'app-reports-home',
  templateUrl: './reports-home.component.html',
  styleUrls: ['./reports-home.component.scss']
})
export class ReportsHomeComponent implements OnInit {
  reports?: Report[];

  constructor(private reportsService: ReportsService) { }

  async ngOnInit(): Promise<void> {
    this.reports = await this.reportsService.list();
  }
}
