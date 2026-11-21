import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { FoodService } from '../../../services/food/food.service';
import { MealPlanService } from '../../../services/meal-plan/meal-plan.service';
import { MealPlanDialog } from './meal-plan-dialog';

describe('MealPlanDialog', () => {
  let fixture: ComponentFixture<MealPlanDialog>;
  const getFoods = vi.fn(() =>
    of({
      items: [
        { foodId: 'FD000001  ', foodName: 'Rice', calories: 130 },
        { foodId: 'FD000002  ', foodName: 'Oats', calories: 150 },
      ],
      totalCount: 2,
    }),
  );
  const save = vi.fn(() => of(undefined));
  const close = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MealPlanDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'add' } },
        { provide: MatDialogRef, useValue: { close } },
        { provide: FoodService, useValue: { getFoods } },
        { provide: MealPlanService, useValue: { save } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MealPlanDialog);
    fixture.detectChanges();
  });

  function click(label: string) {
    const root: HTMLElement = fixture.nativeElement;
    root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click();
    fixture.detectChanges();
  }

  it('adds a selected food and preserves serving details when changing it', () => {
    const dialog = fixture.componentInstance;
    click('Add Rice');
    dialog.details.at(0).patchValue({ mealType: 'Lunch', quantity: 2, mealDate: '2026-11-21' });
    click('Change Rice');
    click('Use Oats');
    dialog.mealPlanForm.controls.planName.setValue('Weekly plan');
    dialog.save();

    expect(save).toHaveBeenCalledWith(
      {
        planName: 'Weekly plan',
        startDate: null,
        endDate: null,
        details: [
          {
            mealPlanDetailId: undefined,
            foodId: 'FD000002',
            mealType: 'Lunch',
            mealDate: '2026-11-21',
            quantity: 2,
          },
        ],
      },
      undefined,
    );
    expect(close).toHaveBeenCalledWith(true);
  });

  it('shows an error and skips the save when a food date falls outside the plan', () => {
    const dialog = fixture.componentInstance;
    click('Add Rice');
    dialog.mealPlanForm.patchValue({ planName: 'Weekly plan', startDate: '2026-11-22' });
    dialog.details.at(0).controls.mealDate.setValue('2026-11-21');
    dialog.save();
    fixture.detectChanges();

    expect(save).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Food item 1 has a meal date outside the plan dates.',
    );
  });
});
