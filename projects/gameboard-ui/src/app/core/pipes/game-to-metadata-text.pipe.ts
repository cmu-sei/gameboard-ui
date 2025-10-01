// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Game, ListGamesResponseGame } from '@/api/game-models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gameToMetadataText',
  standalone: true
})
export class GameToMetadataTextPipe implements PipeTransform {
  transform(value: Game | ListGamesResponseGame): string {
    if (!value) {
      return "";
    }

    let metaData: string[] = [];

    if (value.competition) {
      metaData.push(value.competition);
    }

    if (value.division) {
      metaData.push(value.division);
    }

    if (value.season) {
      metaData.push(value.season);
    }

    if (value.track) {
      metaData.push(value.track);
    }

    return metaData.join(" / ");
  }
}
