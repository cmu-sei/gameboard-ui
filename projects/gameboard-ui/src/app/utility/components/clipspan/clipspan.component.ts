// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { ClipboardService } from '../../services/clipboard.service';
import { faClipboard, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-clipspan',
  templateUrl: './clipspan.component.html',
  styleUrls: ['./clipspan.component.scss']
})
export class ClipspanComponent {
  @ViewChild('span') span!: ElementRef;
  clipped = false;
  hovering = false;
  icon = faClipboard;
  iconChecked = faClipboardCheck;

  constructor(private svc: ClipboardService) { }

  hover(h: boolean): void {
    this.hovering = h;
  }

  copy(): void {
    this.svc.copy(this.span.nativeElement.innerText);
    this.clipped = true;
    const s: Subscription = timer(4000).pipe(
      tap(() => this.clipped = false),
      finalize(() => s.unsubscribe())
    ).subscribe();
  }
}
