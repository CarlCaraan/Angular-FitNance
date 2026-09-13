import { TestBed } from '@angular/core/testing';
import { NutritionGoalsService } from './nutrition-goals.service';

describe('NutritionGoalsService', () => {
  let service: NutritionGoalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NutritionGoalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
