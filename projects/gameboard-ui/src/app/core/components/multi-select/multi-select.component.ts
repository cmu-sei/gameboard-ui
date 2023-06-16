import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '../custom-input/custom-input.component';

// I tried to make this work with generics instead, but Angular had a 
// hard time with it.
// 
// See here if you're curious: https://dev.to/angular/does-angular-support-generic-component-types-4fkm
export interface MultiSelectOption {
  display: string;
  value: string;
}

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
  @Input() showValueSelectHelpThreshold = 5;
  @Input() display: (option: T) => string = (option) => `${option}`;
  @Input() value: (option: T) => any = (option) => `${option}`;

  private static selectedItemsDisplayedThreshold = 3;
  protected displayedOptions = this.options;
  protected searchValue = "";

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.options.currentValue) {
      this.options = [];
      this.displayedOptions = [];

      return;
    }

    if (this.options?.length) {
      this.displayedOptions = [...this.options];
    }
  }

  buildSelectionSummary(selectedItems: T[]): string {
    if (!selectedItems.length) {
      return "";
    }

    let summary = "";

    summary = selectedItems
      .map(i => this.display(i))
      .slice(0, MultiSelectComponent.selectedItemsDisplayedThreshold).join(", ");

    if (selectedItems.length > MultiSelectComponent.selectedItemsDisplayedThreshold)
      summary = `${summary} and ${selectedItems.length - MultiSelectComponent.selectedItemsDisplayedThreshold} other item${(selectedItems.length - MultiSelectComponent.selectedItemsDisplayedThreshold) != 1 ? "s" : ""}`;

    return summary;
  }

  handleCheckedChanged(option: T, event: any) {
    if (!this.ngModel)
      this.ngModel = [];

    const isChecked = (event.target as any).checked;

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

  handleSearchValueChanged(searchValue: string) {
    if (searchValue)
      this.displayedOptions = (this.options || []).filter(i => this.display(i).toLowerCase().indexOf(searchValue.toLowerCase()) >= 0);
    else {
      this.resetDisplayedOptions();
    }
  }

  private resetDisplayedOptions(): void {
    if (!this.options?.length) {
      this.displayedOptions = [];
      return;
    }

    this.displayedOptions = [...this.options];
  }
}
