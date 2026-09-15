import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { FoodService } from '../../services/food/food.service';
import { MasterFood } from '../../models/food/master-food';

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
  ],
  templateUrl: './food.html',
})
export class Food implements OnInit {
  // ==========================================
  // SERVICES
  // ==========================================
  private readonly foodService = inject(FoodService);

  // ==========================================
  // FOOD DATA
  // ==========================================
  foods: MasterFood[] = [];

  // ==========================================
  // PAGINATION
  // ==========================================
  totalCount = 0;
  pageNumber = 1;
  pageSize = 30;

  // ==========================================
  // SEARCH
  // ==========================================
  search = '';

  // ==========================================
  // LOADING
  // ==========================================
  isLoading = false;

  // ==========================================
  // INITIALIZE
  // ==========================================
  ngOnInit(): void {
    this.loadFoods();
  }

  // ==========================================
  // LOAD FOODS
  // ==========================================
  loadFoods(): void {
    this.isLoading = true;

    this.foodService.getFoods(this.pageNumber, this.pageSize, this.search).subscribe({
      next: (response) => {
        this.foods = response.items;
        this.totalCount = response.totalCount;

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading foods:', error);

        this.foods = [];
        this.totalCount = 0;

        this.isLoading = false;
      },
    });
  }

  // ==========================================
  // PAGINATOR
  // ==========================================
  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;

    this.loadFoods();
  }

  // ==========================================
  // SEARCH
  // ==========================================
  onSearch(): void {
    // Reset to first page when searching
    this.pageNumber = 1;

    this.loadFoods();
  }

  // ==========================================
  // CLEAR SEARCH
  // ==========================================
  clearSearch(): void {
    this.search = '';
    this.pageNumber = 1;

    this.loadFoods();
  }
}
