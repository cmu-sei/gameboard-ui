import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ticket-label-picker',
  templateUrl: './ticket-label-picker.component.html',
  styleUrls: ['./ticket-label-picker.component.scss']
})
export class TicketLabelPickerComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<string[]>();

  protected labels: string[] = [];
  protected selectedLabels: string[] = [];
  ngOnInit(): void {
    this.selectedLabels = [
      "flank",
      "practice-challenge",
      "stank"
    ];
  }
}