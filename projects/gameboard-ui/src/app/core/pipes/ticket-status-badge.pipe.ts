import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'ticketStatusBadge' })
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
