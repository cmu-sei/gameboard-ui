import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fa } from '@/services/font-awesome.service';
import { SafeUrlPipe } from '@/standalone/core/pipes/safe-url.pipe';

@Component({
  selector: 'app-vm-link',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    SafeUrlPipe
  ],
  styles: [
    "fa-icon { border-right: solid 1px #fff; padding: 0px 8px }",
    "a { border: solid 1px #fff }",
    "a:hover { color: #41ad57; border: solid 1px #41ad57; }",
    "a:hover fa-icon { border-right: solid 1px #41ad57; }"
  ],
  template: `
    <a *ngIf="vm" class="btn btn-sm btn-dark mr-2 mb-2 d-flex p-0 align-items-center" [href]="vm.url | safeUrl" target="_blank"
        role="button">
        <fa-icon class="d-block" [icon]="fa.computer"></fa-icon>
        <div class="p-2">{{vm.name}}</div>
    </a>
`,
})
export class VmLinkComponent {
  @Input() vm?: { name: string, url: string };

  protected fa = fa;
}
