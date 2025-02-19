import { Injectable } from '@angular/core';
import { environment } from 'projects/gameboard-ui/src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  getThemeBgClass() {
    return environment.settings.custom_background || "custom-bg-black";
  }
}
