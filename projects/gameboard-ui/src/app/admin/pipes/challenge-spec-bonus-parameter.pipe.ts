import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'challengeSpecBonusParameter'
})
export class ChallengeSpecBonusParameterPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
