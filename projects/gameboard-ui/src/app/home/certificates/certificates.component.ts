import { Component } from '@angular/core';
import { fa } from "@/services/font-awesome.service";

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent {
  protected fa = fa;
}
