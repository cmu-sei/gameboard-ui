import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-long-content-hider',
  templateUrl: './long-content-hider.component.html',
  styleUrls: ['./long-content-hider.component.scss']
})
export class LongContentHiderComponent implements AfterViewInit {
  @Input() defaultExpanded = false;
  @Input() maxHeightCollapsed: string = "15rem";
  @ViewChild("contentContainer") contentContainer!: ElementRef;

  protected isExpandEnabled = true;
  protected isExpanded = false;
  private nativeElement!: HTMLParagraphElement;

  public ngAfterViewInit(): void {
    this.nativeElement = this.contentContainer.nativeElement as HTMLParagraphElement;

    if (this.defaultExpanded) {
      this.toggleExpanded();
    }

    // determine if we need to show the expand/collapse control at all
    this.setIsExpandEnabled();
  }

  protected toggleExpanded() {
    if (!this.nativeElement) {
      throw new Error(`Can't toggle visibility of a ${LongContentHiderComponent.name} - not resolved.`);
    }

    this.isExpanded = !this.isExpanded;
  }

  // if the client height (the space the element is actually taking up) is equal to the scroll height (the amount of space
  // the element WANTS to take up), we don't need the expand/collapse controls.
  protected setIsExpandEnabled() {
    this.isExpandEnabled = this.nativeElement && this.nativeElement.clientHeight < this.nativeElement.scrollHeight;

    if (!this.isExpandEnabled) {
      this.isExpanded = true;
    }
  }
}
