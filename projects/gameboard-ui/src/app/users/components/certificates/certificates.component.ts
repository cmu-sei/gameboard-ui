import { Component, OnInit } from '@angular/core';
import { fa } from "@/services/font-awesome.service";
import { PracticeService } from '@/services/practice.service';

@Component({
    selector: 'app-certificates',
    templateUrl: './certificates.component.html',
    styleUrls: ['./certificates.component.scss'],
    standalone: false
})
export class CertificatesComponent implements OnInit {
  protected fa = fa;
  protected showTabs = false;

  constructor(
    private practiceService: PracticeService) { }

  async ngOnInit() {
    // the page defaults to competitive certificates through navigation. If
    // practice area isn't enabled, hide the tabbed interface since it's not needed.
    this.showTabs = await this.practiceService.isEnabled();
  }
}
