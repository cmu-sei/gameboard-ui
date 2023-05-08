import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'ticketStatusBadge' })
export class TicketStatusBadgePipe implements PipeTransform {
  constructor(private safeHtmlThing: DomSanitizer) { }

  transform(value: string): SafeHtml {
    let cssClass = "badge-dark";

    switch (value.toLowerCase()) {
      case "open":
        cssClass = "badge-success";
        break;
      case "in progress":
        cssClass = "badge-info";
        break;
    }

    return this.safeHtmlThing.bypassSecurityTrustHtml(`<span class="badge ${cssClass}">${value}</span>`);
  }
}
