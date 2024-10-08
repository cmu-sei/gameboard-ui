// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  Component, ViewChild, AfterViewInit,
  ElementRef, Input, Injector, HostListener, OnDestroy, Renderer2
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { throwError as ObservableThrower, fromEvent, Subscription, timer, Observable, Subject, firstValueFrom } from 'rxjs';
import { catchError, debounceTime, map, distinctUntilChanged, tap, finalize, switchMap, filter } from 'rxjs/operators';
import { MockConsoleService } from './services/mock-console.service';
import { NoVNCConsoleService } from './services/novnc-console.service';
import { WmksConsoleService } from './services/wmks-console.service';
import { ConsoleService } from './services/console.service';
import { ConsoleActor, ConsolePresence, ConsoleRequest, ConsoleSummary } from '../../api.models';
import { ApiService } from '../../api.service';
import { ClipboardService } from '../../clipboard.service';
import { HubService } from '../../hub.service';
import { UserActivityListenerEventType } from '../user-activity-listener/user-activity-listener.component';
import { ConfigService } from '@/utility/config.service';
import { LogService } from '@/services/log.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  providers: [
    MockConsoleService,
    NoVNCConsoleService,
    WmksConsoleService
  ]
})
export class ConsoleComponent implements AfterViewInit, OnDestroy {
  @Input() index = 0;
  @Input() viewOnly = false;
  @Input() request!: ConsoleRequest;
  @ViewChild('consoleCanvas') consoleCanvas!: ElementRef;
  @ViewChild('audienceDiv') audienceDiv!: ElementRef;
  canvasId = '';
  vmId = '';
  console!: ConsoleService;

  state = 'loading';
  shadowstate = 'loading';
  shadowTimer: any;
  isConnected = false;
  isMock = false;
  cliptext = '';
  stateButtonIcons: any = {};
  stateIcon = '';
  showTools = false;
  showClipboard = true;
  showCog = true;
  justClipped = false;
  justPasted = false;
  nets$: Observable<string[]>;
  refreshNets$ = new Subject<boolean>();
  subs: Array<Subscription> = [];
  audience: Observable<ConsolePresence[]>;
  private audiencePos!: MouseEvent | null;

  constructor(
    hubSvc: HubService,
    private config: ConfigService,
    private injector: Injector,
    private api: ApiService,
    private logService: LogService,
    private titleSvc: Title,
    private clipSvc: ClipboardService,
    private renderer: Renderer2
  ) {
    this.audience = hubSvc.audience;

    api.heartbeat$.subscribe(
      good => {
        if (!good) {
          this.reload();
        }
      }
    );

    this.nets$ = this.refreshNets$.pipe(
      debounceTime(500),
      switchMap(() => api.nets(this.vmId)),
      map(r => r.net)
    );
  }

  ngAfterViewInit(): void {
    this.initHotspot();

    const el = this.consoleCanvas.nativeElement;
    this.canvasId = el.id + this.index;
    el.id += this.index;

    let teamNameBit = "";
    if (this.request.teamName)
      teamNameBit = `${this.request.teamName} on`

    let onConsoleBit = "console";
    if (this.request?.name)
      onConsoleBit = this.request.name;

    let challengeNameBit = "";
    if (this.request.challengeName)
      challengeNameBit = ` :: ${this.request.challengeName}`;

    this.titleSvc.setTitle(teamNameBit + onConsoleBit + challengeNameBit);

    if (!!this.request.observer) {
      this.showCog = false;
    }

    if (!!this.request.observer && !!this.request.userId) {
      this.initCheckConsoleSwitch();
    } else {
      setTimeout(() => this.reload(), 1);
    }

    this.audienceDiv.nativeElement.onmousedown = (e: MouseEvent) => {
      e.preventDefault();
      this.audiencePos = e;
    };
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.console) { this.console.dispose(); }
  }

  changeState(state: string): void {
    if (state.startsWith('clip:')) {
      this.cliptext = state.substring(5);
      this.clipSvc.copyToClipboard(this.cliptext);
      return;
    }

    this.state = state;
    this.logService.logInfo("State to", state);
    this.shadowState(state);
    this.isConnected = state === 'connected';

    switch (state) {
      case 'stopped':
        this.stateIcon = 'Power On';
        break;

      case 'disconnected':
        this.stateIcon = 'Reload';
        break;

      case 'forbidden':
        this.stateIcon = 'Forbidden';
        break;

      case 'failed':
        this.stateIcon = 'Failed';
        break;

      default:
        this.stateIcon = '';
    }
  }

  stateButtonClicked(): void {
    switch (this.state) {
      case 'stopped':
        this.start();
        break;

      default:
        this.reload();
        break;
    }
  }

  reload(): void {
    this.changeState('loading');
    this.api.action({ ...this.request, action: 'ticket' }).pipe(
      catchError((err: Error) => {
        return ObservableThrower(err);
      })
    ).subscribe(
      (info: ConsoleSummary) => this.create(info),
      (err) => {
        const msg = err?.error?.message || err?.message || err;
        this.logService.logError(`Console reload error: ${msg || "[no error resolved]"}`);

        this.changeState(
          msg.match(/forbidden/i) ? 'forbidden' : 'failed'
        );
      }
    );

  }

  create(info: ConsoleSummary): void {
    if (!info.id) {
      this.changeState('failed');
      return;
    }

    if (!info.url || !info.isRunning) {
      this.changeState('stopped');
      return;
    }

    this.vmId = info.id;
    this.isMock = !!(info.url.match(/mock/i));

    // resolve the appropriate console service for this hypervisor
    if (this.isMock) {
      this.console = this.injector.get(MockConsoleService);
    } else if (info.ticket != null) {
      this.console = this.injector.get(NoVNCConsoleService);
    } else {
      this.console = this.injector.get(WmksConsoleService);
    }

    this.console.connect(info.url, (state: string) => this.changeState(state), {
      canvasId: this.canvasId,
      viewOnly: this.viewOnly,
      changeResolution: !!this.request.fullbleed,
      ticket: info.ticket,
    });
  }

  start(): void {
    this.changeState('starting');
    this.api.action({ ...this.request, action: 'reset' }).pipe(
      finalize(() => this.reload())
    ).subscribe();
  }

  shadowState(state: string): void {
    this.shadowstate = state;
    if (this.shadowTimer) { clearTimeout(this.shadowTimer); }
    this.shadowTimer = setTimeout(() => { this.shadowstate = ''; }, 5000);
  }

  showUtilities(): void {
    this.showTools = !this.showTools;
  }

  enterFullscreen(): void {
    if (!!this.console) {
      this.console.fullscreen();
      this.showTools = false;
    }
  }

  resize(): void {
    this.console.refresh();
  }

  resolve(): void {
    this.request.fullbleed = !this.request.fullbleed;
    this.reload();
  }

  scale(): void {
    this.console.toggleScale();
  }

  getNet(): void {
    this.refreshNets$.next(true);
  }

  setNet(net: string): void {
    this.api.update(this.vmId, { key: 'net', value: net }).subscribe();
    // todo: show feedback
  }

  clip(): void {
    this.console.copy();
    this.justClipped = true;
    timer(2000).subscribe(i => this.justClipped = false);
  }

  paste(): void {
    this.console.paste(this.cliptext);
    this.justPasted = true;
    timer(2000).subscribe(i => this.justPasted = false);
  }

  initHotspot(): void {
    this.subs.push(
      fromEvent<MouseEvent>(document, 'mousemove').pipe(
        filter(_ => !this.request.observer),
        tap((e: MouseEvent) => {
          if (this.showTools && e.clientX > 400) {
            this.showTools = false;
          }
        }),
        map((e: MouseEvent) => {
          return this.isConnected && !this.showCog && e.clientX < 4;
        }),
        debounceTime(100),
        distinctUntilChanged()
      ).subscribe(hot => {
        if (hot) {
          this.showTools = true;
        }
      })
    );
  }

  initCheckConsoleSwitch() {
    this.subs.push(
      timer(0, 5_000).pipe(
        switchMap(a => this.api.findConsole(this.request.userId!))
      ).subscribe(
        (c: ConsoleActor) => {
          if (!c) { // no active console for this user yet
            this.changeState('failed');
          } else if (this.request.sessionId != c.challengeId || this.request.name != c.vmName) {
            this.request.sessionId = c.challengeId;
            this.request.name = c.vmName;
            this.titleSvc.setTitle(`console: ${c.vmName}`);
            this.reload();
          }
        },
        (err) => {
          this.changeState('failed')
        }
      )
    );
  }

  protected async handleUserActivity(ev: UserActivityListenerEventType) {
    await firstValueFrom(this.api.userActivity(ev));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.console.refresh();
  }

  @HostListener('window:focus', ['$event'])
  onFocus(): void {
    if (!this.request.observer) {
      this.api.focus(this.request).subscribe();
    }
  }

  @HostListener('document:mouseup', ['$event'])
  dragged(): void {
    this.audiencePos = null;
  }

  @HostListener('document:mousemove', ['$event'])
  dragging(e: MouseEvent): void {

    if (!!this.audiencePos) {

      e.preventDefault();

      const deltaX = this.audiencePos.clientX - e.clientX;
      const deltaY = this.audiencePos.clientY - e.clientY;

      this.renderer.setStyle(
        this.audienceDiv.nativeElement,
        'top',
        this.audienceDiv.nativeElement.offsetTop - deltaY + 'px'
      );

      this.renderer.setStyle(
        this.audienceDiv.nativeElement,
        'left',
        this.audienceDiv.nativeElement.offsetLeft - deltaX + 'px'
      );

      this.audiencePos = e;
    }
  }
}
