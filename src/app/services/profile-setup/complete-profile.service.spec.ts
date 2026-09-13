import { TestBed } from '@angular/core/testing';
import { CompleteProfileService } from './complete-profile.service';

describe('CompleteProfileService', () => {
  let service: CompleteProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompleteProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
