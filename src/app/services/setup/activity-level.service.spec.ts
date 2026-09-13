import { TestBed } from '@angular/core/testing';
import { ActivityLevelService } from './activity-level.service';

describe('ActivityLevelService', () => {
  let service: ActivityLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
