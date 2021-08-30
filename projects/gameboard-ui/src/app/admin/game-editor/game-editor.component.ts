// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { faArrowLeft, faCaretDown, faCaretRight, faCloudUploadAlt, faCopy, faGamepad, faToggleOff, faToggleOn, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ConfigService } from '../../utility/config.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game-editor',
  templateUrl: './game-editor.component.html',
  styleUrls: ['./game-editor.component.scss']
})
export class GameEditorComponent implements OnInit, AfterViewInit {
  @Input() game!: Game;
  @ViewChild(NgForm) form!: FormGroup;

  game$: Observable<Game>;
  loaded$!: Observable<Game>;
  updated$!: Observable<boolean>;
  dirty = false;
  viewing = 1;

  faCaretDown = faCaretDown;
  faCaretRight = faCaretRight;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faCopy = faCopy;
  faTrash = faTrash;
  faSave = faCloudUploadAlt;
  faGo = faGamepad;
  faArrowLeft = faArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: GameService,
    private config: ConfigService
  ) {
    this.game$ = route.params.pipe(
      map(p => p.id),
      filter(id => !!id),
      switchMap(id => api.retrieve(id)),
      tap(g => this.game = g)
    );
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    this.updated$ = this.form.valueChanges.pipe(
      filter(f => !this.form.pristine && (this.form.valid || false)),
      tap(g => this.dirty = true),
      debounceTime(5000),
      switchMap(g => this.api.update(this.game)),
      tap(r => this.dirty = false)
    );

  }

  show(i: number): void {
    this.viewing = i !== this.viewing ? i : 0;
  }

  upload(files: File[], type: string): void {
    this.api.uploadImage(this.game.id, type, files[0]).subscribe(
      r => {
        this.game.logo = r.filename;
        this.game.cardUrl = `${this.config.imagehost}/${r.filename}`;
      }
    );
  }

  clearImage(): void {
    this.api.deleteImage(this.game.id, 'card').subscribe(
      r => {
        this.game.logo = r.filename;
        this.game.cardUrl = `${this.config.basehref}assets/card.png`;
      }
    );
  }

}
