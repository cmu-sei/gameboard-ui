// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ApiUrlService } from '@/services/api-url.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'apiUrl',
    standalone: false
})
export class ApiUrlPipe implements PipeTransform {
  constructor(private apiUrlService: ApiUrlService) { }

  transform(value: string): string | null {
    return this.apiUrlService.build(value);
  }
}
