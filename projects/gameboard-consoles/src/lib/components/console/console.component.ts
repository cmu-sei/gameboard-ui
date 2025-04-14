import { Component, computed, ElementRef, HostListener, inject, Injector, input, model, output, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, timer } from 'rxjs';
import { MarkdownComponent } from 'ngx-markdown';
import { ConsoleComponentConfig } from '../../models/console-component-config';
import { ConsoleSupportsFeatures } from '../../models/console-supports-features';
import { ConsoleCreate } from '../../models/console-create';
import { ConsolePowerOnRequest } from '../../models/console-power-on-request';
import { ConsoleService } from '../../services/console.service';
import { MockConsoleService } from '../../services/mock-console.service';
import { NoVNCConsoleService } from '../../services/novnc-console.service';
import { WmksConsoleService } from '../../services/wmks-console.service';
import { ProgressIndicatorComponent } from "../progress-indicator/progress-indicator.component";
import { EdgeHoverListenerComponent } from "../edge-hover-listener/edge-hover-listener.component";

@Component({
  selector: 'gb-console',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MarkdownComponent,
    ProgressIndicatorComponent,
    EdgeHoverListenerComponent
  ],
  providers: [
    MockConsoleService,
    NoVNCConsoleService,
    WmksConsoleService,
  ],
  templateUrl: './console.component.html',
  styleUrl: './console.component.scss'
})
export class ConsoleComponent {
  // i/o
  public componentConfig = input.required<ConsoleComponentConfig>();
  public index = input<number>(0);
  public connectionStateChanged = output<{ isConnected: boolean }>();

  public clipboardCopyRequest = output<string>();
  public clipboardPasteRequest = output<string>();
  public powerOnRequest = output<ConsolePowerOnRequest>();

  // services
  private injector = inject(Injector);

  // viewkids
  @ViewChild('consoleCanvas') consoleCanvas!: ElementRef;

  // internal state
  protected canvasId = '';
  protected clipboardHelpMarkdown$ = of("");
  protected cliptext = '';
  protected cogIsVisible = computed(() => {
    return !this.componentConfig().isReadOnly && this.showCog() && this.isConnected;
  });
  protected console!: ConsoleService;
  protected consoleSupportsFeatures?: ConsoleSupportsFeatures;
  protected enableAutoCopyVmSelection = false;
  protected isConnected = model(false);
  protected justClipped = false;
  protected justPasted = false;
  protected isMock = false;
  protected showTools = false;
  protected showCog = model<boolean>(true);
  protected shadowstate = 'loading';
  protected shadowTimer: any;
  protected state = 'loading';
  protected stateIcon = '';
  protected stickyTools = false;

  ngAfterViewInit(): void {
    const el = this.consoleCanvas.nativeElement;
    this.canvasId = el.id + this.index();
    el.id += this.index();

    setTimeout(() => this.reload(), 1);
  }

  ngOnDestroy(): void {
    if (this.console) { this.console.dispose(); }
  }

  changeState(state: string): void {
    if (state.startsWith('clip:')) {
      this.cliptext = state.substring(5);
      this.clipboardCopyRequest.emit(this.cliptext);
      return;
    }

    // detect connection state change
    const wasConnected = this.isConnected();
    this.state = state;
    this.shadowState(state);
    this.isConnected.update(() => state === "connected");

    if (!wasConnected && this.isConnected()) {
      this.connectionStateChanged.emit({ isConnected: true });

      if (this.componentConfig()?.autofocus) {
        // this doesn't seem to do the thing but might someday
        const canvasElement = this.consoleCanvas.nativeElement as HTMLElement;
        if (canvasElement) {
          canvasElement.focus();
        }
      }
    } else if (wasConnected && !this.isConnected()) {
      this.connectionStateChanged.emit({ isConnected: false });
    }

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

      case 'unauthorized':
        this.stateIcon = 'Unauthorized';
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

  private async reload(): Promise<void> {
    if (!this.componentConfig()) {
      return;
    }

    this.changeState('loading');

    try {
      this.create({
        id: this.componentConfig().id,
        accessCredential: this.componentConfig().accessCredential,
        url: this.componentConfig().url,
      });
    }
    catch (err) {
      this.changeState('failed');
    }
  }

  private create(consoleCreate: ConsoleCreate): void {
    if (!consoleCreate.id) {
      this.changeState('failed');
      return;
    }

    if (!consoleCreate.url) {
      this.changeState('stopped');
      return;
    }

    this.console = this.resolveConsoleType(consoleCreate);
    this.console.connect(consoleCreate.url, (state: string) => this.changeState(state), {
      accessCredential: consoleCreate.accessCredential,
      canvasId: this.canvasId,
      changeResolution: !!this.componentConfig()?.isFullScreen,
      viewOnly: this.componentConfig()?.isReadOnly || false,
    });

    this.clipboardHelpMarkdown$ = this.console.clipboardHelpText$;
    this.consoleSupportsFeatures = this.console.getSupportedFeatures();

    if (this.consoleSupportsFeatures.autoCopyVmSelection && this.componentConfig().enableAutoCopy !== false) {
      this.handleAutoCopyVmEnableToggle(true);
    }
  }

  start(): void {
    if (!this.componentConfig()) {
      return;
    }

    this.changeState('starting');
    this.powerOnRequest.emit({ id: this.componentConfig().id });
  }

  shadowState(state: string): void {
    this.shadowstate = state;
    if (this.shadowTimer) { clearTimeout(this.shadowTimer); }
    this.shadowTimer = setTimeout(() => { this.shadowstate = ''; }, 5000);
  }

  showUtilities(): void {
    this.showTools = !this.showTools;
  }

  protected enterFullscreen(): void {
    if (!!this.console) {
      this.console.fullscreen(this.consoleCanvas);
      this.showTools = false;
    }
  }

  protected handleToggleScale(): void {
    this.console.toggleScale();
  }

  protected clip(): void {
    this.console.copy();
    this.justClipped = true;
    timer(2000).subscribe(() => this.justClipped = false);
  }

  protected paste(): void {
    this.console.paste(this.cliptext);
    this.clipboardPasteRequest.emit(this.cliptext);
    this.justPasted = true;
    timer(2000).subscribe(() => this.justPasted = false);
  }

  protected handleAutoCopyVmEnableToggle(isEnabled: boolean) {
    this.enableAutoCopyVmSelection = isEnabled;
    this.console.setAutoCopyVmSelection(isEnabled);
  }

  protected handleToolsHover(isHovering: boolean) {
    if (isHovering && !this.showCog() && this.state === "connected") {
      this.showTools = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  protected onResize(event: Event): void {
    this.console?.refresh();
  }

  protected onToolsLeave(e: MouseEvent) {
    if (!this.stickyTools && this.showTools && e.clientX >= 400) {
      this.showTools = false;
    }
  }

  private resolveConsoleType(create: ConsoleCreate): ConsoleService {
    if (!!(create.url.match(/mock/i))) {
      return this.injector.get(MockConsoleService);
    }

    if (create.accessCredential) {
      return this.injector.get(NoVNCConsoleService);
    }

    return this.injector.get(WmksConsoleService);
  }
}
