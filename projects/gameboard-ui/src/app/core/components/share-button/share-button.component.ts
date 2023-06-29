import { Component, Input } from '@angular/core';
import { FontAwesomeService } from '../../../services/font-awesome.service';
import { WindowService } from '../../../services/window.service';
import { ClipboardService } from '../../../utility/services/clipboard.service';
import { ToastService } from '../../../utility/services/toast.service';

@Component({
  selector: 'app-share-button',
  templateUrl: './share-button.component.html',
  styleUrls: ['./share-button.component.scss']
})
export class ShareButtonComponent {
  @Input() message?: string;
  @Input() textSelector?: () => string;
  @Input() size: "small" | "medium" | "large" = "large";

  constructor(
    public faService: FontAwesomeService,
    private clipboardService: ClipboardService,
    private toastService: ToastService,
    private windowService: WindowService) { }

  async handleShareClick() {
    const text = this.textSelector ? this.textSelector() : await this.clipboardService.copy(this.windowService.get().location.href);

    if (this.message)
      this.toastService.showMessage(this.message);
  }
}
