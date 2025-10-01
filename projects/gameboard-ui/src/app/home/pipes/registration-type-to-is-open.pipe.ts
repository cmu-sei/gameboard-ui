// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { GameRegistrationType } from '@/api/game-models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'registrationTypeToIsOpen',
    standalone: false
})
export class RegistrationTypeToIsOpenPipe implements PipeTransform {

  transform(type: GameRegistrationType): boolean {
    if (!type)
      return false;

    return type !== GameRegistrationType.none;
  }

}
