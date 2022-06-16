// Copyright 2021 Carnegie Mellon University.
// Released under a 3 Clause BSD-style license. See LICENSE.md in the project root.

import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { filter, finalize, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { faTrash, faArrowDown, faPaperclip, faUpload, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { SupportService } from '../../../api/support.service';
import { NewTicket } from '../../../api/support-models';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-manager',
  templateUrl: './image-manager.component.html',
  styleUrls: ['./image-manager.component.scss']
})
export class ImageManagerComponent implements OnInit, OnChanges {
  @Input() maxCombinedSizeMB = 30;

  @Input() showIcon = true;
  @Input() defaultHeight = 200;
  @Input() browseButtonStyle = "btn-outline-secondary";
  // @Input() fileList!: File[];
  // @Output() fileListChange = new EventEmitter<File[]>();

  @Output() added = new EventEmitter<File[]>();

  @Input() reset$?: Subject<boolean>;

  dropzone = false;
  drops = new Subject<FileList>();
  refresh = new BehaviorSubject<boolean>(true);
  maxImageSize = 5E7;
  activeImage?: any;
  faTrash = faTrash;
  faPaperclip = faPaperclip;
  faUpload = faUpload;
  faFileAlt = faFileAlt;

  combineSize = 0;

  files = new Map<string, FileData>();

  constructor(
    api: SupportService,
    private sanitizer: DomSanitizer
  ) {

    // this.images$ = this.refresh.pipe(
    //   switchMap(() => api.listImages(this.guid)),
    //   tap((list: ImageFile[]) => list.forEach(img => this.setUrl(img))),
    //   tap((list: ImageFile[]) => this.images = list)
    // );


    this.drops.pipe(
      // mergeMap((list: FileList) => Array.from(list)),
      // tap(a => console.log("files::::::", a)),
      // map(a => Array.from(a).filter((f: Blob) => f.size < this.maxImageSize && 
      //   !!f.type.match(/(image|application)\/(png|jpeg|gif|webp|svg)/)))
      map(a => Array.from(a)),
      // filter((f: File) => f.size < this.maxImageSize),
      // filter((f: File) => !!f.type.match(/(image|application)\/(png|jpeg|gif|webp|pdf)/)),
      // tap((f: File) => console.log(f.name + ' ' + f.size)),
      // tap(a => console.log(a)),
      // switchMap(a => api.upload({files: a} as NewTicket))
    ).subscribe(
      files => {

        files.forEach(file => {
          console.log(file)
          var key = file.name + file.lastModified;
          if (!this.files.has(key)) {
            if (this.combineSize + file.size < this.maxCombinedSizeMB * 1_000_000) {
              this.combineSize += file.size;
              console.log(this.combineSize, this.maxCombinedSizeMB * 1_000_000)
              var data: FileData = {file: file}
              if (file.type.match(/(image|application)\/(png|jpeg|gif|webp|svg)/)) {
                const reader = new FileReader();
                reader.onload = e => {
                  var result = reader.result as string;
                  if (!!result)
                    data.encoded = sanitizer.bypassSecurityTrustResourceUrl(result);
                }
                reader.readAsDataURL(file);
              }
              this.files.set(key, data)
            }
          }
        });

        this.emitFiles();
       

      }
    );

  }

  emitFiles() {
    const files = Array.from(this.files.values()).map((f: FileData) => f.file);
    this.added.emit(files);
    // this.fileListChange.emit(files);
  }

  ngOnInit(): void {
    console.log(this.reset$)
    this.reset$?.subscribe(
      () => {
        console.log("RESET");
        this.files.clear();
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.guid) {
      this.refresh.next(true);
    }
  }

  dropped(img: any): void {
    // this.setUrl(img);
    // this.images.push(img);
  }

  setUrl(img: any): void {
  }

  delete(imgKey: string): void {
    this.combineSize -= (this.files.get(imgKey)?.file.size ?? 0)
    this.files.delete(imgKey);
    this.emitFiles();
    console.log(this.combineSize, this.maxCombinedSizeMB * 1_000_000)
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

  insertOrder() {
    return 0;
  }

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
    this.dropzone = false;
    this.drops.next(event.dataTransfer?.files);
    return false;
  }
}


export interface FileData {
  file: File;
  encoded?: SafeResourceUrl;
}
