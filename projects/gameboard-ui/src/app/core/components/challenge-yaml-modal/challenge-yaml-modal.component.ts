import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from "../../core.module";

@Component({
  selector: 'app-challenge-yaml-modal',
  standalone: true,
  imports: [CommonModule, CoreModule],
  templateUrl: './challenge-yaml-modal.component.html',
  styleUrls: ['./challenge-yaml-modal.component.scss']
})
export class ChallengeYamlModalComponent implements OnInit {
  challengeId?: string;

  ngOnInit(): void {
    if (!this.challengeId) {
      throw new Error("challengeId is required.");
    }
  }
}
