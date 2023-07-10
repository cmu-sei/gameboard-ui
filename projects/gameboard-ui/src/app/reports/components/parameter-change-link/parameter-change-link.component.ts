import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, UrlTree } from '@angular/router';

export interface ParameterChangeRouterLinkConfig {
  parameterChange: any;
}

@Component({
  selector: 'app-parameter-change-link',
  templateUrl: './parameter-change-link.component.html'
})
export class ParameterChangeLinkComponent implements OnInit {
  @Input() config?: ParameterChangeRouterLinkConfig;

  // protected resolvedUrl?: UrlTree;
  protected serializedParameters?: string;
  protected queryParams: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.queryParams = { ...this.route.snapshot.queryParams, ...this.config?.parameterChange };
  }
}
