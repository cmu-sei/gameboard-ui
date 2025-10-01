// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'ticketStatusBadge',
    standalone: false
})
export class TicketStatusBadgePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) { }

  transform(value: string): SafeHtml {
    let cssClass = "badge-dark";

    switch (value.toLowerCase()) {
      case "open":
        cssClass = "badge-info";
        break;
      case "in progress":
        cssClass = "badge-success";
        break;
    }

    return this.domSanitizer.bypassSecurityTrustHtml(`<span class="badge ticket-status-badge ${cssClass}">${value}</span>`);
  }
}
