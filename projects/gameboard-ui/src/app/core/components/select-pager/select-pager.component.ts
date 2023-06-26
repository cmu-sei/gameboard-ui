import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

export interface PagingRequest {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-select-pager',
  templateUrl: './select-pager.component.html',
  styleUrls: ['./select-pager.component.scss']
})
export class SelectPagerComponent implements OnChanges {
  @Input() itemCount?: number;
  @Input() pageSize?: number;
  @Output() change = new EventEmitter<PagingRequest>();

  protected page = 0;
  protected pages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const shouldCalcPages = (changes.itemCount || changes.pageSize);
    const itemCount = changes.itemCount?.currentValue || this.itemCount;
    const pageSize = changes.pageSize?.currentValue || this.pageSize;

    if (shouldCalcPages)
      this.calcPages({ itemCount, pageSize });
  }

  private calcPages(config: { itemCount: number, pageSize: number }) {
    if (!config.itemCount || !config.pageSize) {
      this.pages = [];
      this.setPage(0);
      return;
    }

    const remainder = config.itemCount % config.pageSize;
    const currentPages = Math.floor(config.itemCount / config.pageSize) + (remainder > 0 ? 1 : 0);

    // calc available pages
    this.pages = Array(currentPages).fill(currentPages).map((x, i) => i);

    // set page to clamped value
    this.setPage(this.page);
  }

  protected setPage(pageNumber: number) {
    let clampedPageNumber = Math.max(0, pageNumber);
    clampedPageNumber = Math.min(pageNumber, this.pages.length - 1);

    this.page = clampedPageNumber;
    this.change.emit({ page: this.page, pageSize: this.pageSize! });
  }
}
