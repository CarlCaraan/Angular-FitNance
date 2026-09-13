import { TestBed } from '@angular/core/testing';
import { ProfileSetupService } from './profile-setup.service';

describe('ProfileSetupService', () => {
  let service: ProfileSetupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileSetupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
