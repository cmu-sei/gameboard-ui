// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fa } from '@/services/font-awesome.service';
import { SafeUrlPipe } from '@/standalone/core/pipes/safe-url.pipe';

@Component({
    selector: 'app-vm-link',
    imports: [
        CommonModule,
        FontAwesomeModule,
        SafeUrlPipe
    ],
    styles: [
        ".icon-container { border-right: solid 1px #fff; padding: 0px 4px 4px 4px !important }",
        "a, a:focus { border: solid 1px #fff; color: #fff }",
        "a:hover { color: #41ad57; border: solid 1px #41ad57; }",
        "a:hover .icon-container { border-right: solid 1px #41ad57; }",
        "fa-icon { margin-bottom: 4px }"
    ],
    template: `
    <a *ngIf="vm" class="btn btn-sm btn-dark mr-2 mb-2 d-flex p-0 align-items-center" [href]="vm.url | safeUrl" target="_blank"
        role="button">
        <div class="icon-container">
          <fa-icon class="d-block" [icon]="fa.computer"></fa-icon>
        </div>
        <div class="py-1 px-2">{{vm.name}}</div>
    </a>
`
})
export class VmLinkComponent {
  @Input() vm?: { name: string, url: string };

  protected fa = fa;
}
