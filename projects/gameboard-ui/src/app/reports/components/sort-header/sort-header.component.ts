import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SortDirection } from '@/core/models/sort-direction';
import { fa } from "@/services/font-awesome.service";
import { RouterService } from '@/services/router.service';
import { UnsubscriberService } from '@/services/unsubscriber.service';

@Component({
  selector: 'app-sort-header',
  template: `
  <div class="component-container cursor-pointer d-flex justify-content-center align-items-stretch" [class.active]="isActive" (click)="handleClick()">
    <div class="content-container">
      <ng-content></ng-content>
    </div>
    <fa-icon class="d-block ml-2" [class.text-muted]="!isActive" size="xs" [icon]="!isActive || currentSortDirection == 'asc' ? fa.caretUp : fa.caretDown"></fa-icon>
  </div>`,
  styleUrls: ['./sort-header.component.scss']
})
export class SortHeaderComponent implements OnInit, OnChanges {
  @Input() sortBy?: string;
  @Input() sortQuerystringKey = "sort";
  @Input() sortDirectionQuerystringKey = "sortDirection";

  protected currentSortDirection?: SortDirection;
  protected fa = fa;
  protected isActive = false;

  constructor(
    private route: ActivatedRoute,
    private routerService: RouterService,
    private unsub: UnsubscriberService) { }

  ngOnInit() {
    this.unsub.add(
      this.route.queryParamMap.subscribe(qp => {
        this.isActive = !!this.sortBy && qp.get(this.sortQuerystringKey) === this.sortBy;
        this.currentSortDirection = (qp.get(this.sortDirectionQuerystringKey) as SortDirection) || undefined;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.sortBy)
      throw new Error(`Input 'sortBy' is required.`);
  }

  protected async handleClick() {
    const currentSort = this.route.snapshot.queryParamMap.get(this.sortQuerystringKey);
    const currentDirection = this.route.snapshot.queryParamMap.get(this.sortDirectionQuerystringKey);

    // if we're sorting on something else or not sorting at all,
    // then do a new sort on our param + asc
    let newSort = this.sortBy;
    let newDirection: SortDirection = "asc";

    if (currentSort === this.sortBy) {
      if (currentDirection === "asc")
        newDirection = "desc";
      else {
        newSort = undefined;
      }
    }

    if (newSort) {
      const params: Params = {};
      params[this.sortQuerystringKey] = this.sortBy;
      params[this.sortDirectionQuerystringKey] = newDirection;
      await this.routerService.updateQueryParams({ parameters: params });
      this.isActive = true;
    } else {
      await this.routerService.updateQueryParams({ resetParams: [this.sortQuerystringKey, this.sortDirectionQuerystringKey] });
      this.isActive = false;
    }
  }
}
