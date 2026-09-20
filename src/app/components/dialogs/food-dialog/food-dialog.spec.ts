import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodDialog } from './food-dialog';

describe('FoodDialog', () => {
  let component: FoodDialog;
  let fixture: ComponentFixture<FoodDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
