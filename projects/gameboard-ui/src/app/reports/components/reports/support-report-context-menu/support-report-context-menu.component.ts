import { Component, Input } from '@angular/core';
import { SupportReportRecord } from '../support-report/support-report.models';
import { fa } from '@/services/font-awesome.service';

@Component({
  selector: 'app-support-report-context-menu',
  templateUrl: './support-report-context-menu.component.html',
  styleUrls: ['./support-report-context-menu.component.scss']
})
export class SupportReportContextMenuComponent {
  @Input() record?: SupportReportRecord;

  protected fa = fa;
}
