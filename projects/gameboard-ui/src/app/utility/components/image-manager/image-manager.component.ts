// Copyright 2021 Carnegie Mellon University.
// Released under a 3 Clause BSD-style license. See LICENSE.md in the project root.

import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SecurityContext, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { faTrash, faPaperclip, faUpload, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { SupportService } from '../../../api/support.service';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-image-manager',
    templateUrl: './image-manager.component.html',
    styleUrls: ['./image-manager.component.scss'],
    standalone: false
})
export class ImageManagerComponent implements OnInit, OnChanges {
  @Input() maxCombinedSizeMB = 30;
  @Input() showIcon = true;
  @Input() defaultHeight = 200;
  @Input() browseButtonStyle = "btn-outline-secondary";
  @Input() reset$?: Subject<boolean>;

  @Output() added = new EventEmitter<File[]>(); // emit files to parent component when changed

  dropzone = false;
  drops = new Subject<FileList>();
  refresh = new BehaviorSubject<boolean>(true);
  maxImageSize = 5E7;
  activeImage?: any;
  faTrash = faTrash;
  faPaperclip = faPaperclip;
  faUpload = faUpload;
  faFileAlt = faFileAlt;
  errors: string[] = [];

  private static ALLOWED_MIME_TYPES = [
    "image/bmp",
    "image/jpeg",
    "image/x-png",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "text/plain"
  ];

  combineSize = 0;

  files = new Map<string, FileData>();

  constructor(api: SupportService) {
    this.drops.pipe(
      map(a => Array.from(a)),
    ).subscribe(
      files => {
        if (!this.validateFiles(files))
          return;

        files.forEach(file => {
          const data: FileData = { file: file };
          const reader = new FileReader();
          reader.onload = e => {
            var result = reader.result as string;
            if (!!result) {
              data.encoded = result;
              this.files.set(this.getFileKey(file), data);
              this.emitFiles();
            }
          };
          reader.readAsDataURL(file);
        });
      }
    );
  }

  emitFiles() {
    const files = Array.from(this.files.values()).map((f: FileData) => f.file);
    this.added.emit(files);
  }

  ngOnInit(): void {
    this.reset$?.subscribe(
      () => {
        this.files.clear();
        this.errors = [];
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.guid) {
      this.refresh.next(true);
    }
  }

  delete(imgKey: string): void {
    this.combineSize -= (this.files.get(imgKey)?.file.size ?? 0);
    this.files.delete(imgKey);
    this.emitFiles();
  }

  //
  // Handle component events
  //
  filesSelected(ev: any): void {
    this.drops.next(ev.target.files);
  }

  focus(img: any): void {
    this.activeImage = img;
  }

  blur(img: any): void {
    this.activeImage = null;
  }

  // for maintaining insertion order of set 
  insertOrder() {
    return 0;
  }

  private getFileKey = (file: File) => (file.name + file.lastModified);

  private validateFiles = (files: File[]) => {
    this.errors = [];

    for (const file of files) {
      const fileDescription = files.length > 1 ? `File "${file.name}"'s` : "This file";

      if (this.files.has(this.getFileKey(file))) {
        this.errors.push(`${fileDescription} has already been uploaded.`);
      }

      if (this.combineSize + file.size > (this.maxCombinedSizeMB * 1_000_000)) {
        this.errors.push(`${fileDescription} would cause your total uploads to exceed the maximum allowable size.`);
      }

      if (ImageManagerComponent.ALLOWED_MIME_TYPES.indexOf(file.type.toLowerCase()) < 0) {
        this.errors.push(`${fileDescription} type is not permitted. Permitted file types are .png, .jpeg, .jpg, .gif, .webp, .svg, and .txt.`);
      }
    }

    return !this.errors.length;
  };

  //
  // Handle drag/drop events
  //
  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  onEnter(event: DragEvent): boolean {
    this.dropzone = true;
    return false;
  }
  @HostListener('dragleave', ['$event'])
  @HostListener('dragexit', ['$event'])
  onLeave(event: DragEvent): boolean {
    this.dropzone = false;
    return false;
  }
  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): boolean {
    if (event.dataTransfer?.files) {
      this.dropzone = false;
      this.drops.next(event.dataTransfer?.files);
    }

    return false;
  }
}

export interface FileData {
  file: File;
  encoded?: SafeResourceUrl;
}
