import { Component, Input, OnInit } from '@angular/core';
import { firstValueFrom } from "rxjs";
import { fa } from "@/services/font-awesome.service";
import { SupportService } from '@/api/support.service';

@Component({
    selector: 'app-ticket-label-picker-modal',
    templateUrl: './ticket-label-picker-modal.component.html',
    styleUrls: ['./ticket-label-picker-modal.component.scss'],
    standalone: false
})
export class TicketLabelPickerModalComponent implements OnInit {
  protected fa = fa;
  protected labels: { [label: string]: boolean } = {};
  protected searchText = "";
  protected selectedCount = 0;
  protected totalLabelCount = 0;

  @Input() initialSelection: string[] = [];
  @Input() onConfirm?: (selected: string[]) => void | Promise<void>;

  constructor(private supportService: SupportService) { }

  async ngOnInit(): Promise<void> {
    const allLabels = await firstValueFrom(this.supportService.listLabels());

    this.totalLabelCount = allLabels.length;
    for (const label of allLabels) {
      const isSelected = this.initialSelection.some(s => s === label);
      this.labels[label] = isSelected;
      this.selectedCount += isSelected ? 1 : 0;
    }
  }

  protected handleConfirmSelections() {
    if (this.onConfirm)
      this.onConfirm(Object.keys(this.labels).filter(k => this.labels[k]));
  }

  protected handleLabelSelection(selectedLabel: string) {
    this.labels[selectedLabel] = !this.labels[selectedLabel];

    let selectedCount = 0;

    for (const label in this.labels)
      if (this.labels[label])
        selectedCount += 1;

    this.selectedCount = selectedCount;
  }
}
