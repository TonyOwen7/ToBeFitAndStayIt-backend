import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetabolismComponent } from './metabolism.component';

describe('MetabolismComponent', () => {
  let component: MetabolismComponent;
  let fixture: ComponentFixture<MetabolismComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetabolismComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetabolismComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
