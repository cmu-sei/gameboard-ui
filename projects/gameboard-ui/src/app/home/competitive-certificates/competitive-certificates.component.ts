import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { faArrowLeft, faAward, faPrint, faMedal, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { PlayerCertificate } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './competitive-certificates.component.html',
  styleUrls: ['./competitive-certificates.component.scss']
})
export class CompetitiveCertificatesComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faAward = faAward;
  faMedal = faMedal;
  faPrint = faPrint;
  faUser = faUser;
  faUsers = faUsers;
  certs$: Observable<PlayerCertificate[]>;

  constructor(
    apiPlayer: PlayerService,
    private sanitizer: DomSanitizer
  ) {
    this.certs$ = apiPlayer.getUserCertificates();
  }

  ngOnInit(): void {
  }

  print(cert: PlayerCertificate): void {
    let printWindow = window.open('', '', '');
    // make sure background is always there and no margins to print to pdf as is
    printWindow?.document?.write(`<style type="text/css">* {-webkit-print-color-adjust: exact !important; color-adjust: exact !important; }</style>`);
    printWindow?.document?.write(`<style type="text/css">@media print { body { margin: 0mm!important;} @page{ margin: 0mm!important; }}</style>`);
    printWindow?.document?.write(`<style type="text/css" media="print"> @page { size: landscape; } </style>`);
    printWindow?.document.write(cert.html);
    printWindow?.document.close();
    printWindow?.focus();
    // we're no longer automatically popping the print dialogue because we want them to assume responsibility for scaling/orienting the output
    // (since we can't control it with CSS very well)
    // printWindow?.addEventListener('load', printWindow?.print, true); // wait until all content loads before printing
  }

}
