import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FoodService } from '../../../services/food/food.service';
import { AddFoodRequest } from '../../../models/food/add-food-request';
import { FoodCategories } from '../../../models/setup/food-categories';
import { ServingUnits } from '../../../models/setup/serving-units';
import { FoodCategoriesService } from '../../../services/setup/food-categories.service';
import { ServingUnitsService } from '../../../services/setup/serving-units.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

// ==========================================
// FOOD DIALOG DATA
// ==========================================
export interface FoodDialogData {
  mode: 'add' | 'edit';
  food?: AddFoodRequest & {
    foodId?: number;
  };
}

@Component({
  selector: 'app-food-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './food-dialog.html',
  styleUrl: './food-dialog.css',
})
export class FoodDialog implements OnInit {
  foodCategories: FoodCategories[] = [];
  servingUnits: ServingUnits[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly foodService = inject(FoodService);
  private readonly dialogRef = inject(MatDialogRef<FoodDialog>);
  private readonly foodCategoryService = inject(FoodCategoriesService);
  private readonly servingUnitService = inject(ServingUnitsService);
  private readonly snackBar = inject(MatSnackBar);

  // ==========================================
  // DIALOG DATA
  // ==========================================
  readonly data = inject<FoodDialogData>(MAT_DIALOG_DATA);

  // ==========================================
  // LOADING
  // ==========================================
  isSaving = false;

  // ==========================================
  // FOOD FORM
  // ==========================================
  foodForm = this.fb.nonNullable.group({
    foodName: ['', Validators.required],
    category: ['', Validators.required],
    servingSize: [null as number | null, Validators.required],
    servingUnit: ['', Validators.required],
    servingGrams: [null as number | null, Validators.required],
    calories: [null as number | null, Validators.required],
    protein: [null as number | null, Validators.required],
    carbs: [null as number | null, Validators.required],
    fat: [null as number | null, Validators.required],
    fiber: [null as number | null, Validators.required],
    sodium: [null as number | null, Validators.required],
    sugar: [null as number | null, Validators.required],
    cholesterol: [null as number | null, Validators.required],
    isCanned: [false],
    isFastFood: [false],
  });

  // ==========================================
  // INITIALIZE
  // ==========================================
  ngOnInit(): void {
    forkJoin({
      categories: this.foodCategoryService.getFoodCategories(),
      servingUnits: this.servingUnitService.getServingUnits(),
    }).subscribe({
      next: (data) => {
        // ==========================================
        // LOAD DROPDOWN DATA
        // ==========================================
        this.foodCategories = data.categories;
        this.servingUnits = data.servingUnits;

        // ==========================================
        // LOAD FOOD FOR EDIT
        // ==========================================
        if (this.data.mode === 'edit' && this.data.food) {
          this.foodForm.patchValue({
            foodName: this.data.food.foodName,
            category: this.data.food.category,
            servingSize: this.data.food.servingSize,
            servingUnit: this.data.food.servingUnit,
            servingGrams: this.data.food.servingGrams,
            calories: this.data.food.calories,
            protein: this.data.food.protein,
            carbs: this.data.food.carbs,
            fat: this.data.food.fat,
            fiber: this.data.food.fiber,
            sodium: this.data.food.sodium,
            sugar: this.data.food.sugar,
            cholesterol: this.data.food.cholesterol,
            isCanned: this.data.food.isCanned,
            isFastFood: this.data.food.isFastFood,
          });
        }
      },

      error: (error) => {
        console.error('Failed to load dropdown data:', error);
      },
    });
  }

  // ==========================================
  // SAVE FOOD
  // ==========================================
  save(): void {
    // ==========================================
    // VALIDATION
    // ==========================================
    if (this.foodForm.invalid) {
      this.foodForm.markAllAsTouched();
      return;
    }

    // ==========================================
    // DETERMINE SAVE MODE
    // ==========================================
    if (this.data.mode === 'edit') {
      this.updateFood();
      return;
    }

    this.addFood();
  }

  // ==========================================
  // ADD FOOD
  // ==========================================
  private addFood(): void {
    const food: AddFoodRequest = this.foodForm.getRawValue();

    // ==========================================
    // SAVING
    // ==========================================
    this.isSaving = true;

    this.foodService.addFood(food).subscribe({
      next: (response) => {
        this.isSaving = false;

        console.log('ADD FOOD RESPONSE:', response);

        // ==========================================
        // CLOSE DIALOG
        // ==========================================
        this.dialogRef.close({
          added: true,
          foodId: response.foodId,
        });
      },

      error: (error) => {
        console.error('Failed to add food:', error);

        this.isSaving = false;

        this.snackBar.open('Failed to add food.', 'DISMISS', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      },
    });
  }

  // ==========================================
  // UPDATE FOOD
  // ==========================================
  private updateFood(): void {
    // ==========================================
    // GET FOOD ID
    // ==========================================
    const foodId = this.data.food?.foodId;

    if (!foodId) {
      console.error('Food ID is missing.');

      this.snackBar.open('Unable to update food.', 'DISMISS', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });

      return;
    }

    const food: AddFoodRequest = this.foodForm.getRawValue();

    // ==========================================
    // UPDATING
    // ==========================================
    this.isSaving = true;

    this.foodService.updateFood(foodId, food).subscribe({
      next: (response) => {
        this.isSaving = false;

        console.log('UPDATE FOOD RESPONSE:', response);

        // ==========================================
        // CLOSE DIALOG
        // ==========================================
        this.dialogRef.close({
          updated: true,
          foodId: foodId,
        });
      },

      error: (error) => {
        console.error('Failed to update food:', error);

        this.isSaving = false;

        this.snackBar.open('Failed to update food.', 'DISMISS', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      },
    });
  }
}
