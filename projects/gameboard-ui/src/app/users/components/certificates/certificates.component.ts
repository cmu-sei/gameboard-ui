import { Component, OnInit } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { PracticeService } from '@/services/practice.service';
import { firstValueFrom } from 'rxjs';
import { RouterService } from '@/services/router.service';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {
  protected fa = fa;
  protected showTabs = false;
  protected profileUrl: string;

  constructor(
    private practiceService: PracticeService,
    routerService: RouterService) {
    this.profileUrl = routerService.getProfileUrl();
  }

  async ngOnInit() {
    // the page defaults to competitive certificates through navigation. If
    // practice area isn't enabled or if there's no certificate template, hide the tabbed
    // interface since it's not needed.
    const practiceSettings = await firstValueFrom(this.practiceService.getSettings());
    this.showTabs = await this.practiceService.isEnabled() && !!practiceSettings.certificateHtmlTemplate;
  }
}
