import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDynamicComponent } from './report-dynamic.component';

describe('ReportDynamicComponent', () => {
  let component: ReportDynamicComponent;
  let fixture: ComponentFixture<ReportDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportDynamicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
