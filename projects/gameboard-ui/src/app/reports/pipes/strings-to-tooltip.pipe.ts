import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'stringsToTooltip'
})
export class StringsToTooltipPipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) { }

  transform(value: string[], itemType: string): string {
    let retVal = "";
    const mappedValues = value.map(v => v ?? `[Unspecified ${itemType}]`)

    // if (tooltipTitle) {
    //   retVal += `<h2>${tooltipTitle}</h2>`;
    // }

    retVal = (retVal + '\n' + mappedValues.join("<br/>")) || "";

    return this.domSanitizer.sanitize(SecurityContext.HTML, retVal) || "";
  }

}
