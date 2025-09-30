// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { inject, Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '@/utility/config.service';

@Pipe({ name: 'challengeGroupCardImage' })
export class ChallengeGroupCardImagePipe implements PipeTransform {
  private readonly configService = inject(ConfigService);
  private readonly defaultCardImage = "/assets/img/practice-challenge-group/default-card.svg";

  transform(value?: string): string {
    if (!value) {
      return this.defaultCardImage;
    }

    return `${this.configService.imagehost}/${value}`;
  }
}
