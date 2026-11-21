import { DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { MasterFood } from '../../../models/food/food';
import { MealPlanItem, MealPlanRequest } from '../../../models/meal-plan/meal-plan';
import { FoodService } from '../../../services/food/food.service';
import { MealPlanService } from '../../../services/meal-plan/meal-plan.service';

export type MealPlanDialogData =
  { mode: 'add'; id?: never } | { mode: 'edit' | 'view'; id: string };

@Component({
  selector: 'app-meal-plan-dialog',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './meal-plan-dialog.html',
  styleUrl: './meal-plan-dialog.css',
})
export class MealPlanDialog implements OnInit {
  readonly data = inject<MealPlanDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<MealPlanDialog, boolean>);
  private readonly plans = inject(MealPlanService);
  private readonly foodService = inject(FoodService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly foodRequests = new Subject<void>();
  private readonly foodSearchInput = viewChild<ElementRef<HTMLInputElement>>('foodSearchInput');

  readonly plan = signal<MealPlanRequest | null>(null);
  readonly details = this.fb.array<ReturnType<MealPlanDialog['createItem']>>([]);
  readonly mealPlanForm = this.fb.nonNullable.group({
    planName: ['', [Validators.required, Validators.maxLength(150)]],
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null),
    details: this.details,
  });
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadFailed = signal(false);
  readonly error = signal('');
  readonly foodError = signal('');
  readonly foods = signal<MasterFood[]>([]);
  readonly foodLoading = signal(false);
  readonly foodCount = signal(0);
  readonly foodSearch = this.fb.nonNullable.control('');
  readonly foodNames = new Map<string, string>();
  readonly pickerOpen = signal(this.data.mode === 'add');
  readonly replacing = signal<ReturnType<MealPlanDialog['createItem']> | null>(null);
  readonly feedback = signal('');
  readonly mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  readonly foodPageSize = 6;
  foodPage = 1;
  private appliedFoodSearch = '';

  ngOnInit() {
    if (this.data.id) {
      this.loading.set(true);
      this.plans
        .get(this.data.id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.loading.set(false)),
        )
        .subscribe({
          next: (plan) => {
            this.plan.set(plan);
            if (this.data.mode === 'edit') {
              this.mealPlanForm.patchValue({
                planName: plan.planName,
                startDate: plan.startDate,
                endDate: plan.endDate,
              });
              for (const item of plan.details) {
                this.details.push(this.createItem(item));
                if (item.foodName) this.foodNames.set(item.foodId.trim(), item.foodName);
              }
            }
          },
          error: () => {
            this.loadFailed.set(true);
            this.error.set('Could not load the meal plan.');
          },
        });
    }
    if (this.data.mode === 'view') return;

    this.foodRequests
      .pipe(
        tap(() => {
          this.foodLoading.set(true);
          this.foodError.set('');
        }),
        switchMap(() =>
          this.foodService
            .getFoods(this.foodPage, this.foodPageSize, this.appliedFoodSearch)
            .pipe(catchError(() => of(null))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.foodLoading.set(false);
        this.foods.set(response?.items ?? []);
        this.foodCount.set(response?.totalCount ?? 0);
        if (!response) this.foodError.set('Could not load foods.');
      });

    this.foodSearch.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.pickerOpen()) this.searchFoods();
      });

    if (this.pickerOpen()) this.searchFoods();
  }

  togglePicker() {
    this.replacing.set(null);
    this.pickerOpen.update((open) => !open);
    if (this.pickerOpen()) this.openPicker();
  }

  changeFood(item: ReturnType<MealPlanDialog['createItem']>) {
    this.replacing.set(item);
    this.openPicker();
  }

  private openPicker() {
    this.pickerOpen.set(true);
    this.searchFoods();
    afterNextRender(() => this.foodSearchInput()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  searchFoods() {
    this.appliedFoodSearch = this.foodSearch.value.trim();
    this.foodPage = 1;
    this.foodRequests.next();
  }

  moveFoodPage(offset: number) {
    this.foodPage += offset;
    this.foodRequests.next();
  }

  addItem(food: MasterFood) {
    const previous = this.details.controls.at(-1)?.getRawValue();
    const foodId = food.foodId.trim();
    this.foodNames.set(foodId, food.foodName);
    const replacement = this.replacing();
    if (replacement) {
      replacement.controls.foodId.setValue(foodId);
      if (
        foodId !== replacement.controls.foodId.defaultValue &&
        replacement.controls.quantity.value === null
      )
        replacement.controls.quantity.setValue(1);
      this.replacing.set(null);
      this.pickerOpen.set(false);
      this.feedback.set(`Food changed to ${food.foodName}.`);
      return;
    }
    this.details.push(
      this.createItem({
        foodId,
        mealType: previous?.mealType || 'Breakfast',
        mealDate: null,
        quantity: 1,
      }),
    );
    this.feedback.set(`${food.foodName} added. ${this.details.length} food items in this plan.`);
  }

  removeItem(index: number) {
    const item = this.details.at(index);
    const foodId = item.controls.foodId.value;
    if (this.replacing() === item) this.replacing.set(null);
    this.details.removeAt(index);
    this.feedback.set(
      `${this.foodNames.get(foodId) ?? foodId} removed. ${this.details.length} food items in this plan.`,
    );
  }

  private createItem(item?: MealPlanItem) {
    const quantityValidators = [Validators.min(0.000001), Validators.max(1000000)];
    if (!item?.mealPlanDetailId) quantityValidators.push(Validators.required);

    return this.fb.nonNullable.group({
      mealPlanDetailId: new FormControl(item?.mealPlanDetailId, { nonNullable: true }),
      foodId: [item?.foodId.trim() ?? '', Validators.required],
      mealType: [item?.mealType ?? '', [Validators.required, Validators.maxLength(50)]],
      mealDate: new FormControl(item?.mealDate ?? null),
      quantity: new FormControl(item ? item.quantity : 1, quantityValidators),
    });
  }

  save() {
    if (this.loading() || this.saving() || this.loadFailed() || this.data.mode === 'view') return;
    if (this.mealPlanForm.invalid) {
      this.mealPlanForm.markAllAsTouched();
      this.error.set('Check the highlighted fields before saving.');
      return;
    }

    const { planName, startDate, endDate, details } = this.mealPlanForm.getRawValue();
    if (!planName.trim() || details.some((item) => !item.mealType.trim())) {
      this.error.set('Enter a plan name and a meal type for each food item.');
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      this.error.set('End date must be on or after the start date.');
      return;
    }
    const outsidePlan = details.findIndex(
      ({ mealDate }) =>
        mealDate && ((startDate && mealDate < startDate) || (endDate && mealDate > endDate)),
    );
    if (outsidePlan !== -1) {
      this.error.set(`Food item ${outsidePlan + 1} has a meal date outside the plan dates.`);
      return;
    }

    const request: MealPlanRequest = {
      planName: planName.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      details: details.map(({ mealPlanDetailId, foodId, mealType, mealDate, quantity }) => ({
        mealPlanDetailId: mealPlanDetailId ?? undefined,
        foodId,
        mealType: mealType.trim(),
        mealDate: mealDate || null,
        quantity,
      })),
    };
    this.error.set('');
    this.saving.set(true);
    this.dialogRef.disableClose = true;
    this.plans
      .save(request, this.data.id)
      .pipe(
        finalize(() => {
          this.saving.set(false);
          this.dialogRef.disableClose = false;
        }),
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (response) =>
          this.error.set(response.error?.message ?? 'Could not save the meal plan.'),
      });
  }
}
