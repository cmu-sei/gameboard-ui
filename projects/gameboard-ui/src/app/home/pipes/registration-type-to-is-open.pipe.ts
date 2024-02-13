import { GameRegistrationType } from '@/api/game-models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'registrationTypeToIsOpen' })
export class RegistrationTypeToIsOpenPipe implements PipeTransform {

  transform(type: GameRegistrationType): boolean {
    if (!type)
      return false;

    return type !== GameRegistrationType.none;
  }

}
