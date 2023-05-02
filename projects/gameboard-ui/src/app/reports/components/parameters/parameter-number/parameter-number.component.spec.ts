import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterNumberComponent } from './parameter-number.component';

describe('ParameterNumberComponent', () => {
  let component: ParameterNumberComponent;
  let fixture: ComponentFixture<ParameterNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParameterNumberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParameterNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
