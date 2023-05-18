import { Injectable } from '@angular/core';
import Toastify from "toastify-js";
import { ConfigService } from '../config.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeService } from '../../services/font-awesome.service';

export interface ToastOptions {
  text: string;
  duration?: number;
  destination?: string;
  faIcon?: IconDefinition;
  // called when the toast is dismissed
  callback?: () => void;
  // called when the user clicks the toast
  onClick?: () => void;
  showCloseIcon?: boolean;
}

interface FixedToastOptions {
  className: string;
  duration: number;
  escapeMarkup: boolean;
  gravity: "top" | "bottom";
  position: "center" | "right" | "left";
  showCloseIcon: boolean;
  style: { [rule: string]: string };
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(
    private config: ConfigService,
    private faService: FontAwesomeService) { }

  private FIXED_OPTIONS: FixedToastOptions = {
    className: "gb-toast",
    duration: 5000,
    escapeMarkup: false,
    gravity: "top",
    position: "center",
    showCloseIcon: true,
    style: {
      background: "var(--dark)",
      border: `solid 1px ${this.config.settings.custom_background || "var(--light)"}`
    },
  };

  showMessage(text: string) {
    this.show({ text });
  }

  show(opts: ToastOptions) {
    Toastify(this.toVendorOpts(opts)).showToast();
  }

  // to decouple direct reliance on toastify and enforce uniform
  // behavior across gameboard
  private toVendorOpts(options: ToastOptions): Toastify.Options {
    const iconMarkup = options.faIcon ? this.faService.iconToSvg(options.faIcon) : null;
    const textTemplate = `<div class="toast-container">${iconMarkup || ""}${options.text}</div>`;

    return {
      ...options,
      ...this.FIXED_OPTIONS,
      close: options.showCloseIcon,
      text: textTemplate
    };
  }
}
