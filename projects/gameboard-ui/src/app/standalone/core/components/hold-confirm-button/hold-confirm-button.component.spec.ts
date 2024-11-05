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
