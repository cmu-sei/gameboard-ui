// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { PagingArgs } from '@/api/models';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-select-pager',
    templateUrl: './select-pager.component.html',
    styleUrls: ['./select-pager.component.scss'],
    standalone: false
})
export class SelectPagerComponent implements OnChanges {
  @Input() itemCount?: number;
  @Input() pageSize?: number;
  @Output() pageChange = new EventEmitter<PagingArgs>();

  protected isHidden = false;
  protected pageNumber = 0;
  protected pages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const shouldCalcPages = (changes.itemCount || changes.pageSize);
    const itemCount = changes.itemCount?.currentValue || this.itemCount;
    const pageSize = changes.pageSize?.currentValue || this.pageSize;
    this.isHidden = (itemCount <= pageSize);

    if (shouldCalcPages) {
      this.calcPages({ itemCount, pageSize });
    }
  }

  private calcPages(config: { itemCount: number, pageSize: number }) {
    if (!config.itemCount || !config.pageSize) {
      this.pages = [];
      this.setPageNumber(0);
      return;
    }

    const remainder = config.itemCount % config.pageSize;
    const currentPages = Math.floor(config.itemCount / config.pageSize) + (remainder > 0 ? 1 : 0);

    // calc available pages
    this.pages = Array(currentPages).fill(currentPages).map((x, i) => i);

    // set page to clamped value
    const clampedPageNumber = this.clampPageNumber(this.pageNumber);

    if (this.pageNumber !== clampedPageNumber) {
      this.setPageNumber(clampedPageNumber);
    }
  }

  protected setPageNumber(pageNumber: number) {
    const clampedPageNumber = this.clampPageNumber(pageNumber);
    this.pageNumber = this.clampPageNumber(clampedPageNumber);
    this.pageChange.emit({ pageNumber: clampedPageNumber, pageSize: this.pageSize! });
  }

  private clampPageNumber(newPageNumber: number): number {
    let clampedPageNumber = Math.max(0, newPageNumber);
    clampedPageNumber = Math.min(newPageNumber, this.pages.length - 1);
    clampedPageNumber = clampedPageNumber < 0 ? 0 : clampedPageNumber;

    return clampedPageNumber;
  }
}
