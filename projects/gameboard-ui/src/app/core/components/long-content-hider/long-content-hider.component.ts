import { WindowService } from '@/services/window.service';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-long-content-hider',
    templateUrl: './long-content-hider.component.html',
    styleUrls: ['./long-content-hider.component.scss'],
    standalone: false
})
export class LongContentHiderComponent implements AfterViewInit {
  @Input() defaultExpanded = false;
  @Input() maxHeightCollapsed = "15rem";
  @ViewChild("contentContainer") contentContainer!: ElementRef;

  private nativeElement!: HTMLDivElement;

  protected isExpanded = false;
  protected isExpandEnabled?: boolean;

  constructor(private windowService: WindowService) { }

  public ngOnInit() {
    if (this.defaultExpanded) {
      this.isExpanded = true;
    }
  }

  public ngAfterViewInit(): void {
    this.nativeElement = this.contentContainer.nativeElement as HTMLDivElement;
  }

  public ngAfterContentChecked() {
    // determine if we need to show the expand/collapse control at all
    // if the client height (the space the element is actually taking up) is equal to the scroll height (the amount of space
    // the element WANTS to take up), we don't need the expand/collapse controls.
    if (this.nativeElement?.clientHeight) {
      this.isExpandEnabled = this.nativeElement && this.nativeElement.clientHeight >= this.windowService.remToPx(this.maxHeightCollapsed);
    }
  }

  protected toggleExpanded() {
    if (!this.isExpandEnabled)
      throw new Error(`Can't toggle visibility of a ${LongContentHiderComponent.name} - expand is disabled.`);

    if (!this.nativeElement) {
      throw new Error(`Can't toggle visibility of a ${LongContentHiderComponent.name} - not resolved.`);
    }

    this.isExpanded = !this.isExpanded;
  }
}
