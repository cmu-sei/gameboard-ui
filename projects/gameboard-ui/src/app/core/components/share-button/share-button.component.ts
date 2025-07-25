import { Component, Input } from '@angular/core';
import { fa } from '@/services/font-awesome.service';
import { WindowService } from '@/services/window.service';
import { ClipboardService } from '@/utility/services/clipboard.service';
import { ToastService } from '@/utility/services/toast.service';

@Component({
    selector: 'app-share-button',
    templateUrl: './share-button.component.html',
    standalone: false
})
export class ShareButtonComponent {
  @Input() disabled?: boolean;
  @Input() message?: string;
  @Input() shareContent?: string;
  @Input() size: "small" | "medium" | "large" = "large";
  @Input() tooltip?: string;

  protected fa = fa;

  constructor(
    private clipboardService: ClipboardService,
    private toastService: ToastService,
    private windowService: WindowService) { }

  async handleShareClick() {
    await this.clipboardService.copy(this.shareContent || this.windowService.get().location.href);

    if (this.message)
      this.toastService.showMessage(this.message);
  }
}
