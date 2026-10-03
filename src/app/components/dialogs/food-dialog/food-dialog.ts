import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FoodService } from '../../../services/food/food.service';
import { AddFoodRequest } from '../../../models/food/add-food-request';
import { FoodCategories } from '../../../models/setup/food-categories';
import { ServingUnits } from '../../../models/setup/serving-units';
import { FoodCategoriesService } from '../../../services/setup/food-categories.service';
import { ServingUnitsService } from '../../../services/setup/serving-units.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-food-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './food-dialog.html',
  styleUrl: './food-dialog.css',
})
export class FoodDialog {
  foodCategories: FoodCategories[] = [];
  servingUnits: ServingUnits[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly foodService = inject(FoodService);
  private readonly dialogRef = inject(MatDialogRef<FoodDialog>);
  private readonly foodCategoryService = inject(FoodCategoriesService);
  private readonly servingUnitService = inject(ServingUnitsService);
  private readonly snackBar = inject(MatSnackBar);

  isSaving = false;

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

  ngOnInit(): void {
    this.loadFoodCategories();
    this.loadServingUnits();
  }

  // ==========================================
  // LOAD FOOD CATEGORIES
  // ==========================================
  private loadFoodCategories(): void {
    this.foodCategoryService.getFoodCategories().subscribe({
      next: (data) => {
        this.foodCategories = data;
      },
      error: (error) => {
        console.error('Failed to load food categories:', error);
      },
    });
  }

  // ==========================================
  // LOAD SERVING UNITS
  // ==========================================
  private loadServingUnits(): void {
    this.servingUnitService.getServingUnits().subscribe({
      next: (data) => {
        this.servingUnits = data;
      },
      error: (error) => {
        console.error('Failed to load serving units:', error);
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
}
