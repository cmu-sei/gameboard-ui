import { ApiUrlService } from '@/services/api-url.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'apiUrl' })
export class ApiUrlPipe implements PipeTransform {
  constructor(private apiUrlService: ApiUrlService) { }

  transform(value: string): string | null {
    return this.apiUrlService.build(value);
  }
}
