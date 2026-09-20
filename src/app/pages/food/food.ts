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
  ],
  templateUrl: './food.html',
})
export class Food implements OnInit {
  // ==========================================
  // SERVICES
  // ==========================================
  private readonly foodService = inject(FoodService);
  private readonly dialog = inject(MatDialog);

  // ==========================================
  // FOOD DATA
  // ==========================================
  // foods: MasterFood[] = [];
  foods = signal<MasterFood[]>([]);
  selectedFood: MasterFood | null = null;

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

  addFood(): void {
    this.dialog.open(FoodDialog, {
      width: '600px',
      maxWidth: '95vw',
    });
  }

  // ==========================================
  // LOAD FOODS
  // ==========================================
  loadFoods(): void {
    console.log('LOAD FOODS:', this.pageNumber, this.pageSize);

    this.isLoading.set(true);

    this.foodService.getFoods(this.pageNumber(), this.pageSize(), this.search).subscribe({
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
}
