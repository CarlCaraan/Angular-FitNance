import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Food } from './food';
import { FoodService } from '../../services/food/food.service';

describe('Food', () => {
  let component: Food;
  let fixture: ComponentFixture<Food>;

  const foodServiceMock = {
    getFoods: () =>
      of({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
      }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Food],
      providers: [
        {
          provide: FoodService,
          useValue: foodServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Food);
    component = fixture.componentInstance;

    fixture.detectChanges();

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
