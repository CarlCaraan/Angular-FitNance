import { TestBed } from '@angular/core/testing';
import { ServingUnitsService } from './serving-units.service';

describe('ServingUnitsService', () => {
  let service: ServingUnitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServingUnitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
