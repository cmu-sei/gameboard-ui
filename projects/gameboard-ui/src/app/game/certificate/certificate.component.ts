import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GameContext } from '../../api/game-models';
import { PlayerService } from '../../api/player.service';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit {
  @Input() ctx!: GameContext;
  cert$!: Observable<string>;
  toPrint: string = "";
  faPrint = faPrint;

  constructor(
    private apiPlayer: PlayerService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.cert$ = this.apiPlayer.getCertificate(this.ctx.player.id).pipe(
      tap(g => this.toPrint = g.html),
      // sanitize html to render in iframe binding and add wrapper div to center certificate
      map(g => this.sanitizer.sanitize(SecurityContext.HTML, `<div style="max-width: max-content; margin: auto;">${g.html}</div>`) || ''),
    );
  }

  print(): void {
    let printWindow = window.open('', '', '');
    // make sure background is always there and no margins to print to pdf as is
    printWindow?.document?.write(`<style type="text/css">* {-webkit-print-color-adjust: exact !important; color-adjust: exact !important; }</style>`);
    printWindow?.document?.write(`<style type="text/css">@media print { body { margin: 0mm!important;} @page{ margin: 0mm!important; }}</style>`);
    printWindow?.document?.write(`<style type="text/css" media="print"> @page { size: landscape; } </style>`);
    printWindow?.document.write(this.toPrint);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.addEventListener('load', printWindow?.print, true); // wait until all content loads before printing
    // don't close new tab automatically in case want to keep open for some reason [ printWindow?.close(); ]
  }
}
