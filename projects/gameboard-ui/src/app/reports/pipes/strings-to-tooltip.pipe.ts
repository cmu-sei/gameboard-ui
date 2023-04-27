import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringsToTooltip'
})
export class StringsToTooltipPipe implements PipeTransform {

  transform(value: string[], tooltipTitle: string): string {
    let retVal = "";

    // if (tooltipTitle) {
    //   retVal += `<h2>${tooltipTitle}</h2>`;
    // }

    return retVal + '\n' + value.join("\n");
  }

}
