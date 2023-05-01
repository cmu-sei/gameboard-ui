import { Component } from '@angular/core';
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
  constructor(
    public faService: FontAwesomeService,
    private clipboardService: ClipboardService,
    private toastService: ToastService,
    private windowService: WindowService) { }

  async handleShareClick() {
    await this.clipboardService.copy(this.windowService.get().location.href);
    this.toastService.showMessage("Copied a link to this report (and its filtering settings) to your clipboard.");
  }
}
