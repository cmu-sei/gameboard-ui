import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageManualChallengeBonusesModalComponent } from './manage-manual-challenge-bonuses-modal.component';

describe('ManageManualChallengeBonusesModalComponent', () => {
  let component: ManageManualChallengeBonusesModalComponent;
  let fixture: ComponentFixture<ManageManualChallengeBonusesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageManualChallengeBonusesModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageManualChallengeBonusesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
