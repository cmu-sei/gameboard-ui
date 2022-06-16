import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportReportComponent } from './support-report.component';

describe('SupportReportComponent', () => {
  let component: SupportReportComponent;
  let fixture: ComponentFixture<SupportReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupportReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
