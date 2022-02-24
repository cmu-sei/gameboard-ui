import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'shorttime'})
export class ShortTimePipe implements PipeTransform {

  transform(date: any): string {
    const t = new Date(date);
    return t.toLocaleTimeString("en-US", { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'});
}

}
