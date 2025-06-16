import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WellnessTipsComponent } from './wellness-tips.component';

describe('WellnessTipsComponent', () => {
  let component: WellnessTipsComponent;
  let fixture: ComponentFixture<WellnessTipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WellnessTipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WellnessTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
