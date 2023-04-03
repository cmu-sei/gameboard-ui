import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NowService {
  now(): Date {
    return new Date();
  }
}
