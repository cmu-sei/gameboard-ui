// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import * as YAML from 'yaml';

@Pipe({
    name: 'yaml',
    standalone: false
})
export class YamlPipe implements PipeTransform {
  transform(value: any): string {
    return YAML.stringify(value);
  }
}
