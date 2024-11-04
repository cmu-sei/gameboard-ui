import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, UrlTree } from '@angular/router';

export interface ParameterChangeRouterLinkConfig {
  parameterChange: any;
  disable?: boolean;
}

@Component({
  selector: 'app-parameter-change-link',
  template: `
    <a *ngIf="!isDisabled; else disabled" [routerLink]="'./'" [queryParams]="queryParams" [hidden]="isDisabled">
        <ng-container *ngTemplateOutlet="content"></ng-container>
    </a>

    <ng-template #disabled>
      <span class="subtle-info">
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </span>
    </ng-template>

    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class ParameterChangeLinkComponent implements OnInit {
  @Input() config?: ParameterChangeRouterLinkConfig;

  protected isDisabled = false;
  protected queryParams: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.isDisabled = (this.config?.disable || false);
    this.queryParams = { ...this.route.snapshot.queryParams, ...this.config?.parameterChange };
  }
}
