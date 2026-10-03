import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FoodService } from '../../services/food/food.service';
import { MasterFood } from '../../models/food/master-food';
import { FoodDialog } from '../../components/dialogs/food-dialog/food-dialog';
import { ConfirmDialog } from '../../components/dialogs/confirm-dialog/confirm-dialog';
import { forkJoin } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-food',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './food.html',
})
export class Food implements OnInit {
  // ==========================================
  // SERVICES
  // ==========================================
  private readonly foodService = inject(FoodService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // ==========================================
  // FOOD DATA
  // ==========================================
  // foods: MasterFood[] = [];
  foods = signal<MasterFood[]>([]);
  selectedFood: MasterFood | null = null;

  // ==========================================
  // FOOD SOURCE FILTER
  // ==========================================
  foodSource = signal<'all' | 'system' | 'user'>('all');

  // ==========================================
  // PAGINATION
  // ==========================================
  // totalCount = 0;
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(10);

  // ==========================================
  // SEARCH
  // ==========================================
  search = '';

  // ==========================================
  // LOADING
  // ==========================================
  // isLoading = false;
  isLoading = signal(false);

  // ==========================================
  // INITIALIZE
  // ==========================================
  ngOnInit(): void {
    this.loadFoods();
  }

  // ==========================================
  // FOOD SOURCE CHANGE
  // ==========================================
  onFoodSourceChange(source: 'all' | 'system' | 'user'): void {
    this.foodSource.set(source);

    // Reset to first page
    this.pageNumber.set(1);

    // Reload immediately
    this.loadFoods();
  }

  // ==========================================
  // ADD FOOD
  // ==========================================
  addFood(): void {
    const dialogRef = this.dialog.open(FoodDialog, {
      width: '600px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.added) {
        return;
      }

      // ==========================================
      // RELOAD FOOD LIST
      // ==========================================
      this.loadFoods();

      // ==========================================
      // SUCCESS SNACKBAR
      // ==========================================
      this.snackBar
        .open('Food added successfully.', 'UNDO', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        })
        .onAction()
        .subscribe(() => {
          // ==========================================
          // DELETE RECENTLY ADDED FOOD
          // ==========================================
          this.foodService.deleteFood([result.foodId]).subscribe({
            next: () => {
              console.log('Undo successful. Food deleted:', result.foodId);

              // ==========================================
              // RELOAD FOOD LIST
              // ==========================================
              this.loadFoods();
            },
            error: (error) => {
              console.error('Undo delete failed:', error);
            },
          });
        });
    });
  }

  // ==========================================
  // LOAD FOODS
  // ==========================================
  loadFoods(): void {
    console.log('LOAD FOODS:', this.pageNumber, this.pageSize);

    this.isLoading.set(true);

    this.foodService
      .getFoods(this.pageNumber(), this.pageSize(), this.search, this.foodSource())
      .subscribe({
        next: (response) => {
          console.log('RESPONSE:', response);
          console.log('ITEMS:', response.items);
          console.log('ITEM COUNT:', response.items?.length);
          console.log('TOTAL COUNT:', response.totalCount);

          this.foods.set(response.items ?? []);
          this.totalCount.set(response.totalCount ?? 0);

          console.log('FOODS AFTER ASSIGN:', this.foods());
          console.log('FOODS LENGTH:', this.foods().length);

          this.isLoading.set(false);
        },

        error: (error) => {
          console.error('ERROR:', error);

          this.foods.set([]);
          this.totalCount.set(0);
          this.isLoading.set(false);
        },
      });
  }

  // ==========================================
  // PAGINATOR
  // ==========================================
  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);

    this.loadFoods();
  }

  // ==========================================
  // SEARCH
  // ==========================================
  onSearch(): void {
    // Reset to first page when searching
    this.pageNumber.set(1);

    this.loadFoods();
  }

  // ==========================================
  // CLEAR SEARCH
  // ==========================================
  clearSearch(): void {
    this.search = '';
    this.pageNumber.set(1);

    this.loadFoods();
  }

  // ==========================================
  // FOOD SELECTION
  // ==========================================

  selectedFoodIds = new Set<string>();

  toggleFoodSelection(foodId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedFoodIds.add(foodId);
    } else {
      this.selectedFoodIds.delete(foodId);
    }
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    const selectableFoods = this.foods().filter((food) => food.userId !== 'D');

    if (checked) {
      selectableFoods.forEach((food) => {
        this.selectedFoodIds.add(food.foodId);
      });
    } else {
      selectableFoods.forEach((food) => {
        this.selectedFoodIds.delete(food.foodId);
      });
    }
  }

  isAllSelected(): boolean {
    const selectableFoods = this.foods().filter((food) => food.userId !== 'D');

    if (selectableFoods.length === 0) {
      return false;
    }

    return selectableFoods.every((food) => this.selectedFoodIds.has(food.foodId));
  }

  isSomeSelected(): boolean {
    const selectableFoods = this.foods().filter((food) => food.userId !== 'D');

    const selectedCount = selectableFoods.filter((food) =>
      this.selectedFoodIds.has(food.foodId),
    ).length;

    return selectedCount > 0 && selectedCount < selectableFoods.length;
  }

  // ==========================================
  // DELETE FOOD
  // ==========================================
  deleteFood(): void {
    if (this.selectedFoodIds.size === 0) {
      return;
    }

    const selectedFoods = this.foods().filter((food) => this.selectedFoodIds.has(food.foodId));

    console.log('SELECTED FOODS:', selectedFoods);

    if (selectedFoods.length === 0) {
      return;
    }

    const foodNames = selectedFoods.map((food) => food.foodName).join(', ');

    console.log('FOOD NAMES:', foodNames);

    // ==========================================
    // CONFIRM DELETE DIALOG
    // ==========================================
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Delete Food',
        message: `Are you sure you want to delete ${selectedFoods.length} food(s)?\n\n${foodNames}`,
        icon: '🗑️',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      // ==========================================
      // LOADING
      // ==========================================
      this.isLoading.set(true);

      const foodIds = selectedFoods.map((food) => food.foodId);

      console.log('FOOD IDS:', foodIds);

      // ==========================================
      // DELETE FOODS
      // ==========================================
      this.foodService.deleteFood(foodIds).subscribe({
        next: (response) => {
          console.log('DELETE RESPONSE:', response);

          this.selectedFood = null;
          this.selectedFoodIds.clear();

          this.loadFoods();

          this.snackBar.open('Food deleted successfully.', 'UNDO', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
        },
        error: (error) => {
          console.error('Error deleting food:', error);

          this.isLoading.set(false);

          this.snackBar.open('Food deleted successfully.', 'UNDO', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
        },
      });
    });
  }
}
