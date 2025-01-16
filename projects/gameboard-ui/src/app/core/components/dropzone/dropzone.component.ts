// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { StringArrayJoinPipe } from '@/core/pipes/string-array-join.pipe';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss']
})
export class DropzoneComponent {
  @Input() inputId = 'dropzone-input';
  @Input() btnClass = 'btn btn-outline-secondary btn-sm';
  @Input() allowMultiple = false;
  @Input() acceptMimeTypes: string[] = ["*"];
  @Input() browseText = "Browse";
  @Input() clickToLaunchFilePicker = true;
  @Output() dropped = new EventEmitter<File[]>();

  protected isDropping = false;

  // Handle component events
  filesSelected(ev: any): void {
    this.dropped.emit(Array.from(ev.target.files));
    ev.target.value = null;
  }

  // Handle drag/drop events
  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  onEnter(event: DragEvent): boolean {
    this.isDropping = true;
    return false;
  }

  @HostListener('dragleave', ['$event'])
  @HostListener('dragexit', ['$event'])
  onLeave(event: DragEvent): boolean {
    this.isDropping = false;
    return false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): boolean {
    this.isDropping = false;
    this.dropped.emit(Array.from(event.dataTransfer?.files || []));
    return false;
  }
}
