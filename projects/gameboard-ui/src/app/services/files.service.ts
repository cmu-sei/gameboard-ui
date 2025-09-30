// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { NowService } from './now.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilesService {

  constructor(private http: HttpClient, private now: NowService) { }

  private buildTimestamp(): string {
    const date: Date = new Date();
    const month: number = date.getUTCMonth() + 1;
    const day: number = date.getUTCDate();
    const year: number = date.getUTCFullYear();
    const hours: number = date.getUTCHours();
    const minutes: number = date.getUTCMinutes();
    const seconds: number = date.getUTCSeconds();

    return year + '-' + month + '-' + day + '-' + hours + minutes + seconds;
  }

  public async downloadFileFrom(url: string, name: string, extension: string, contentType: string, addTimestamp = true) {
    const finalName = `${name}${addTimestamp ? this.buildTimestamp() : ''}.${extension}`;
    const response = await firstValueFrom(this.http.get(url, {
      headers: {
        "Content-Type": contentType
      },
      responseType: 'arraybuffer'
    }));
    this.downloadFile(response, finalName, contentType);
  }

  public downloadFile(data: any, name: string, type: string) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
