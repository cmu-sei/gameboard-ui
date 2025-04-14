// Copyright 2021 Carnegie Mellon University.
// Released under a 3 Clause BSD-style license. See LICENSE.md in the project root.

import { DOCUMENT } from '@angular/common';
import { ElementRef, inject, Injectable } from '@angular/core';
import NoVncClient from '@novnc/novnc/core/rfb';
import { BehaviorSubject } from 'rxjs';
import { ConsoleService } from './console.service';
import { ConsoleOptions } from '../models/console-options';
import { ConsoleSupportsFeatures } from '../models/console-supports-features';

@Injectable()
export class NoVNCConsoleService implements ConsoleService {
  private client!: NoVncClient;
  private clipboardHelpTextSubject$ = new BehaviorSubject<string>("");
  private document = inject(DOCUMENT);
  private consoleClipboardText = "";
  private enableAutoCopy = true;
  private options?: ConsoleOptions;

  public clipboardHelpText$ = this.clipboardHelpTextSubject$.asObservable();
  // wired up upon connection
  public stateChanged!: (state: string) => void;

  constructor() {
    // enable auto-copy by default
    this.setAutoCopyVmSelection(true);
  }

  connect(
    url: string,
    stateCallback: (state: string) => void,
    options: ConsoleOptions
  ): void {
    // update options
    this.options = { ...this.options, ...options };

    // wire up state callback
    if (stateCallback) {
      this.stateChanged = stateCallback;
    }

    // create and configure client
    this.client = new NoVncClient(
      document.getElementById(this.options.canvasId)!,
      url,
      {
        credentials: {
          password: this.options.accessCredential!,
          target: '',
          username: '',
        },
      }
    );

    this.client.resizeSession = this.options.changeResolution;
    this.client.scaleViewport = true;
    this.client.viewOnly = this.options.viewOnly;

    this.client.addEventListener("clipboard", clipboardEv => {
      this.consoleClipboardText = clipboardEv.detail.text;

      if (this.stateChanged && this.enableAutoCopy) {
        this.stateChanged('clip:' + this.consoleClipboardText);
      }
    });

    this.client.addEventListener('connect', () => {
      stateCallback('connected');
    });

    this.client.addEventListener('disconnect', () => {
      stateCallback('disconnected');
    });
  }

  disconnect(): void { }

  getSupportedFeatures(): ConsoleSupportsFeatures {
    return {
      autoCopyVmSelection: true,
      virtualKeyboard: false,
      pasteToClipboard: true
    };
  }

  sendCAD(): void {
    this.client.sendCtrlAltDel();
  }

  setAutoCopyVmSelection(enabled: boolean): void {
    this.enableAutoCopy = enabled;

    const copyHelp = this.enableAutoCopy ?
      "Text selected in the virtual console is automatically written to the textbox below. Use the **Copy** button to copy it to your local clipboard." :
      "**Copy** places the text content of the virtual console's clipboard on your local clipboard.";

    this.clipboardHelpTextSubject$.next(`${copyHelp}\n\n**Paste** copies the text below to the virtual console's clipboard.`);
  }

  copy(): void {
    if (!this.document.defaultView?.navigator) {
      throw new Error("Can't access the navigator for clipboard access.");
    }

    this
      .document
      .defaultView
      .navigator
      .clipboard
      .writeText(this.consoleClipboardText);

    this.stateChanged(`clip:${this.consoleClipboardText}`);
  }

  async paste(text: string): Promise<void> {
    this.client.clipboardPasteFrom(text);
  }

  toggleScale(): void {
    this.client.scaleViewport = !this.client.scaleViewport;
  }

  async fullscreen(consoleHostRef?: ElementRef): Promise<void> {
    const typedHost = consoleHostRef?.nativeElement as HTMLElement;
    if (!typedHost) {
      throw new Error("Couldn't resolve the canvas element to enable fullscreen support.");
    }

    await typedHost.requestFullscreen({ navigationUI: 'hide' });
  }

  // no-op (not supported or unnecessary on novnc)
  refresh(): void { }
  showKeyboard(): void { }
  showExtKeypad(): void { }
  showTrackpad(): void { }

  dispose(): void { }
}
