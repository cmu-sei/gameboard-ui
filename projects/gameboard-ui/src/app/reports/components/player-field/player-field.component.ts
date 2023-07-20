import { Component, Input } from '@angular/core';
import { ReportSponsor } from '@/reports/reports-models';
import { SimpleEntity } from '@/api/models';

@Component({
  selector: 'app-player-field',
  templateUrl: './player-field.component.html',
  styleUrls: ['./player-field.component.scss']
})
export class PlayerFieldComponent {
  @Input() player?: {
    userId: string;
    name: string;
    sponsor?: ReportSponsor;
    team?: SimpleEntity
  };
}
