// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { firstValueFrom } from 'rxjs';
import { PracticeService } from '@/services/practice.service';

@Component({
  selector: 'app-practice-tabs-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MarkdownComponent
  ],
  templateUrl: './practice-tabs-layout.component.html',
  styleUrl: './practice-tabs-layout.component.scss'
})
export class PracticeTabsLayoutComponent {
  private readonly practiceService = inject(PracticeService);

  private readonly settingsResource = resource({
    loader: () => firstValueFrom(this.practiceService.getSettings())
  });
  protected readonly introTextMarkdown = computed(() => this.settingsResource.value()?.introTextMarkdown || "");
}
