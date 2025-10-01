// Copyright 2025 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldConfirmButtonComponent } from './hold-confirm-button.component';

describe('HoldConfirmButtonComponent', () => {
  let component: HoldConfirmButtonComponent;
  let fixture: ComponentFixture<HoldConfirmButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HoldConfirmButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldConfirmButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
