import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class AppTitleService {

  constructor(private title: Title) { }

  public get(): string {
    return this.title.getTitle();
  }

  public set(appTitle: string): void {
    if (appTitle) {
       this.title.setTitle(`${appTitle} | Gameboard`);
    }
    else {
      this.title.setTitle("Gameboard");
    }
  }
}
