import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '../custom-input/custom-input.component';
import { ModalConfirmService } from '@/services/modal-confirm.service';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  providers: [createCustomInputControlValueAccessor(MultiSelectComponent)]
})
export class MultiSelectComponent<T> extends CustomInputComponent<T[]> implements OnChanges {
  @Input() label?: string;
  @Input() searchPlaceholder?: string = "Search items";
  @Input() options: T[] | null = [];
  @Input() showSearchBoxThreshold = 6;
  @Input() showSelectionSummaryThreshold = 0;
  @Input() display: (option: T) => string = (option) => `${option}`;
  @Input() value: (option: T) => any = (option) => `${option}`;

  private static selectedItemsDisplayedThreshold = 4;
  protected searchValue = "";
  protected countSelectedOverDisplayThreshold = 0;

  constructor(private modalService: ModalConfirmService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // force options not to be empty and to be an array if it isn't
    if (changes.options) {
      if (!changes.options.currentValue) {
        this.options = [];
      } else if (!Array.isArray(changes.options.currentValue)) {
        this.options = [changes.options.currentValue];
      }
    }

    // coerce ngmodel to be an array if it isn't
    if (changes.ngModel) {
      this._coerceNgModelToArray();
    }
  }

  private _coerceNgModelToArray() {
    if (!this.ngModel) {
      this.ngModel = [];
    } else {
      if (!Array.isArray(this.ngModel)) {
        this.ngModel = [this.ngModel];
      }
    }
  }

  buildSelectionSummary(selectedItems: T[]): string {
    if (!selectedItems.length) {
      return "";
    }

    let summary = selectedItems
      .map(i => this.display(i))
      .slice(0, MultiSelectComponent.selectedItemsDisplayedThreshold).join(", ");

    this.countSelectedOverDisplayThreshold = Math.max(selectedItems.length - MultiSelectComponent.selectedItemsDisplayedThreshold, 0);

    return summary;
  }

  handleCheckedChanged(option: T, event: any) {
    const isChecked = (event.target as any).checked;
    if (!this.ngModel)
      this.ngModel = [];

    // if the box isn't checked, we must be removing an item
    if (!isChecked) {
      const indexToRemove = this.ngModel.findIndex(opt => opt === option);
      if (indexToRemove >= 0)
        this.ngModel.splice(indexToRemove, 1);

      return;
    }

    // if we're not removing, we must be adding
    this.ngModel.push(option);
  }

  getOptionIsChecked(option: T) {
    // HACK
    // i don't know how ngModel is ever anything but an array since we're handling it in 
    // ngOnChanges, but coerce it here again as a workaround for now
    this._coerceNgModelToArray();
    const optionValue = this.value(option);
    return this.ngModel && this.ngModel.some(o => this.value(o) === optionValue);
  }

  getOptionVisibility(option: T) {
    if (!this.searchValue) {
      return true;
    }

    const optionText = this.display(option).toLowerCase();
    return optionText.indexOf(this.searchValue.toLowerCase()) >= 0;
  }

  handleClearSelectionsClicked() {
    this.ngModel = [];
  }

  handleSelectedOverDisplayThresholdClicked() {
    const displaySelectedOptions = this.ngModel!
      .map(o => this.display(o));

    // sort works in place, so we have to do this separately
    displaySelectedOptions.sort();

    // then transform to markdown so we can render as a bulleted list
    this.modalService.openConfirm({
      title: `Selected ${this.label}`,
      hideCancel: true,
      renderBodyAsMarkdown: true,
      bodyContent: displaySelectedOptions
        .map(labeledOption => `\n- ${labeledOption}`)
        .join("")
    });
  }
}
