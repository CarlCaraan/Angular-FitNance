import { TestBed } from '@angular/core/testing';
import { FoodCategoriesService } from './food-categories.service';

describe('FoodCategoriesService', () => {
  let service: FoodCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
