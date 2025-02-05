import { AfterViewInit, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomInputComponent, createCustomInputControlValueAccessor } from '../custom-input/custom-input.component';
import { fa } from "@/services/font-awesome.service";
import { ModalConfirmService } from '@/services/modal-confirm.service';
import { MarkdownHelpersService } from '@/services/markdown-helpers.service';
import { MultiSelectQueryParamModel } from '@/core/models/multi-select-query-param.model';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  providers: [createCustomInputControlValueAccessor(MultiSelectComponent)]
})
export class MultiSelectComponent<TItem> extends CustomInputComponent<MultiSelectQueryParamModel<TItem>> implements OnInit, AfterViewInit, OnDestroy {
  @Input() label?: string;
  @Input() searchPlaceholder?: string = "Search items";
  @Input() options: TItem[] | null = [];
  @Input() showSearchBoxThreshold = 6;
  @Input() showSelectionSummaryThreshold = 0;
  @Input() getSearchText: (option: TItem) => string = option => `${option}`;
  @Input() value: (option: TItem) => string = option => option as unknown as string;

  private _itemTemplate: TemplateRef<Object> | null = null;
  public get itemTemplate() { return this._itemTemplate; }
  @Input() public set itemTemplate(value: TemplateRef<Object> | null) { this._itemTemplate = value; }

  @ViewChild("defaultItemTemplate") defaultItemTemplate?: TemplateRef<Object>;

  protected countSelectedOverDisplayThreshold = 0;
  protected fa = fa;
  protected selectionSummary = "";

  private _ngModelChangeSub?: Subscription;
  private static selectedItemsDisplayedThreshold = 4;

  constructor(
    private markdownHelpers: MarkdownHelpersService,
    private modalService: ModalConfirmService) {
    super();
  }

  ngOnInit(): void {
    if (!this.ngModel) {
      throw new Error("MultiSelectComponent requires an ngModel binding.");
    }

    this._ngModelChangeSub = this.ngModel.modelUpdate$.subscribe(model => this.handleNgModelChanged.bind(this)(model));
  }

  ngAfterViewInit(): void {
    this._itemTemplate = this._itemTemplate ? this.itemTemplate : this.defaultItemTemplate || null;
  }

  ngOnDestroy(): void {
    this._ngModelChangeSub?.unsubscribe();
  }

  updateSelectionSummary(selectedItemValues: string[] | null): void {
    if (!selectedItemValues?.length || !this.options?.length) {
      this.selectionSummary = "";
      this.countSelectedOverDisplayThreshold = 0;
      return;
    }

    const summary = (this.options || [])
      .filter(o => selectedItemValues.some(s => s == this.value(o)))
      .map(i => this.getSearchText(i))
      .slice(0, MultiSelectComponent.selectedItemsDisplayedThreshold).join(", ");

    this.countSelectedOverDisplayThreshold = Math.max(selectedItemValues.length - MultiSelectComponent.selectedItemsDisplayedThreshold, 0);
    this.selectionSummary = summary;
  }

  handleCheckedChanged(option: TItem, event: any) {
    if (!this.ngModel)
      return;

    const isChecked = (event.target as any).checked;

    // if the box isn't checked, we must be removing an item
    if (!isChecked) {
      this.ngModel.selectedValues = [...this.ngModel.selectedValues.filter(i => i !== option)];
      return;
    }

    // if we're not removing, we must be adding
    this.ngModel.selectedValues = [...this.ngModel.selectedValues, option];
  }

  handleClearClicked() {
    if (this.ngModel) {
      this.ngModel.searchText = undefined;
    }
  }

  getOptionIsChecked(option: TItem) {
    const optionValue = this.value(option);
    return this.ngModel && this.ngModel.selectedValues.some(o => this.value(o) === optionValue);
  }

  getOptionVisibility(option: TItem) {
    if (!this.ngModel?.searchText) {
      return true;
    }

    const optionText = this.getSearchText(option).toLowerCase();
    return optionText.indexOf(this.ngModel.searchText.toLowerCase()) >= 0;
  }

  handleClearSelectionsClicked() {
    this.ngModel!.selectedValues = [];
  }

  handleNgModelChanged(model: TItem[] | null) {
    this.updateSelectionSummary((model || []).map(o => this.value(o)));
  }

  handleSelectedOverDisplayThresholdClicked() {
    const displaySelectedOptions = this.ngModel!
      .selectedValues
      .map(o => this.getSearchText(o));

    // sort works in place, so we have to do this separately
    displaySelectedOptions.sort();

    // then transform to markdown so we can render as a bulleted list
    this.modalService.openConfirm({
      title: `Selected ${this.label}`,
      hideCancel: true,
      renderBodyAsMarkdown: true,
      bodyContent: this.markdownHelpers.arrayToBulletList(displaySelectedOptions)
    });
  }
}
