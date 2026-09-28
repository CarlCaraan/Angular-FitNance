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

@Component({
  selector: 'app-food-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule],
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

  isSaving = false;

  foodForm = this.fb.nonNullable.group({
    foodName: ['', Validators.required],
    category: [''],
    servingSize: [null as number | null],
    servingUnit: [''],
    servingGrams: [null as number | null],
    calories: [null as number | null],
    protein: [null as number | null],
    carbs: [null as number | null],
    fat: [null as number | null],
    fiber: [null as number | null],
    sodium: [null as number | null],
    sugar: [null as number | null],
    cholesterol: [null as number | null],
    isCanned: [false],
    isFastFood: [false],
  });

  ngOnInit(): void {
    this.loadFoodCategories();
    this.loadServingUnits();
  }

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

  save(): void {
    console.log(
      'Food Name:',
      this.foodForm.get('foodName')?.touched,
      this.foodForm.get('foodName')?.dirty,
    );
    if (this.foodForm.invalid) {
      this.foodForm.markAllAsTouched();
      return;
    }

    const food: AddFoodRequest = this.foodForm.getRawValue();

    this.isSaving = true;

    this.foodService.addFood(food).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Failed to add food:', error);
        this.isSaving = false;
      },
    });
  }
}
