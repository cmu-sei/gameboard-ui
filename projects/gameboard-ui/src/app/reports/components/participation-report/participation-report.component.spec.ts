import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipationReportComponent } from './participation-report.component';

describe('ParticipationReportComponent', () => {
  let component: ParticipationReportComponent;
  let fixture: ComponentFixture<ParticipationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParticipationReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
