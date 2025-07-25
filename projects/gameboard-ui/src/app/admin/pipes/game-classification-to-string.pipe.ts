import { Pipe, PipeTransform } from '@angular/core';

type GameClassification = {
  competition: string | null | undefined;
  season: string | null | undefined;
  track: string | null | undefined;
}

@Pipe({
    name: 'gameClassificationToString',
    standalone: false
})
export class GameClassificationToStringPipe implements PipeTransform {
  transform(value: GameClassification): string | null {
    if (!value)
      return null;

    const classificationBits: string[] = [
      value.competition || "",
      value.season || "",
      value.track || ""
    ];

    return classificationBits
      .filter(b => !!b)
      .join(" | ");
  }
}
