import { PracticeModeCertificate } from '@/prac/practice.models';
import { PracticeService } from '@/services/practice.service';
import { WindowService } from '@/services/window.service';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { slug } from '@/tools/functions';

interface PracticeCertificatesContext {
  certificates: PracticeModeCertificate[];
}

@Component({
  selector: 'app-practice-certificates',
  templateUrl: './practice-certificates.component.html',
  styleUrls: ['./practice-certificates.component.scss']
})
export class PracticeCertificatesComponent implements OnInit {
  ctx: PracticeCertificatesContext | null = null;
  protected slug = slug;

  constructor(
    private practiceService: PracticeService,
    private windowService: WindowService) { }

  async ngOnInit(): Promise<void> {
    this.ctx = {
      certificates: await firstValueFrom(this.practiceService.getCertificates())
    };
  }

  protected async handleCertificateClick(certificate: PracticeModeCertificate): Promise<void> {
    const html = await firstValueFrom(this.practiceService.getCertificateHtml(certificate));
    this.print(html!.toString());
  }

  print(certHtml: string | null): void {
    if (!certHtml)
      throw new Error("Can't open a certificate window with no html content.");

    const printWindow = this.windowService.get().open(undefined, "_blank")!;
    printWindow.document.write(certHtml.toString());
    printWindow.document.close();
    printWindow.focus();
  }
}
