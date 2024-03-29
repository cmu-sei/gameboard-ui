import { PagingArgs } from '@/api/models';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({
  selector: 'app-select-pager',
  templateUrl: './select-pager.component.html',
  styleUrls: ['./select-pager.component.scss']
})
export class SelectPagerComponent implements OnChanges {
  @Input() itemCount?: number;
  @Input() pageSize?: number;
  @Output() change = new EventEmitter<PagingArgs>();

  protected isHidden = false;
  protected pageNumber = 0;
  protected pages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const shouldCalcPages = (changes.itemCount || changes.pageSize);
    const itemCount = changes.itemCount?.currentValue || this.itemCount;
    const pageSize = changes.pageSize?.currentValue || this.pageSize;
    this.isHidden = (itemCount <= pageSize);

    if (shouldCalcPages)
      this.calcPages({ itemCount, pageSize });
  }

  private calcPages(config: { itemCount: number, pageSize: number }) {
    if (!config.itemCount || !config.pageSize) {
      this.pages = [];
      this.setPageNumber(this.pageNumber || 0);
      return;
    }

    const remainder = config.itemCount % config.pageSize;
    const currentPages = Math.floor(config.itemCount / config.pageSize) + (remainder > 0 ? 1 : 0);

    // calc available pages
    this.pages = Array(currentPages).fill(currentPages).map((x, i) => i);

    // set page to clamped value
    this.setPageNumber(this.pageNumber);
  }

  protected setPageNumber(pageNumber: number) {
    let clampedPageNumber = Math.max(0, pageNumber);
    clampedPageNumber = Math.min(pageNumber, this.pages.length - 1);
    clampedPageNumber = clampedPageNumber < 0 ? 0 : clampedPageNumber;

    if (this.pageNumber !== clampedPageNumber) {
      this.pageNumber = clampedPageNumber;
      this.change.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize! });
    }
  }
}
