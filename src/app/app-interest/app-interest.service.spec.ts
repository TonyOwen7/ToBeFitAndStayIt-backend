import { TestBed } from '@angular/core/testing';

import { AppInterestService } from './app-interest.service';

describe('AppInterestService', () => {
  let service: AppInterestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppInterestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
