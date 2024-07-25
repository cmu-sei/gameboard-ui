import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { TicketLabelPickerModalComponent } from '../../../support/components/ticket-label-picker-modal/ticket-label-picker-modal.component';

@Component({
  selector: 'app-ticket-label-picker',
  templateUrl: './ticket-label-picker.component.html',
  styleUrls: ['./ticket-label-picker.component.scss']
})
export class TicketLabelPickerComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<string[]>();

  protected fa = fa;
  protected selectedLabels: string[] = [];

  constructor(
    private modalService: ModalConfirmService) { }

  ngOnInit(): void {
  }

  protected handleLabelAddClick(selectedLabels: string[]) {
    this.handleOpenModal(selectedLabels);
  }

  protected handleLabelClick(label: string) {
    this.selectedLabels = [... this.selectedLabels.filter(l => l !== label)];
    this.selectionChanged.emit(this.selectedLabels || []);
  }

  protected async handleOpenModal(selectedLabels: string[]) {
    this.modalService.openComponent({
      content: TicketLabelPickerModalComponent,
      context: {
        initialSelection: this.selectedLabels,
        onConfirm: selected => this.handleSelectionChanged(selected),
      },
    });
  }

  protected handleSelectionChanged(selections: string[]) {
    this.selectedLabels = selections;
    this.selectionChanged.emit(selections || []);
  }
}
