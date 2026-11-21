import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { ConfirmDialog } from '../../components/dialogs/confirm-dialog/confirm-dialog';
import {
  MealPlanDialog,
  MealPlanDialogData,
} from '../../components/dialogs/meal-plan-dialog/meal-plan-dialog';
import { MealPlanSummary } from '../../models/meal-plan/meal-plan';
import { LoadingService } from '../../services/loading/loading.service';
import { MealPlanService } from '../../services/meal-plan/meal-plan.service';

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatIconModule, MatPaginatorModule],
  templateUrl: './meal-plan.html',
})
export class MealPlan implements OnInit {
  private readonly service = inject(MealPlanService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly loadingService = inject(LoadingService);

  readonly plans = signal<MealPlanSummary[]>([]);
  readonly totalCount = signal(0);
  readonly busy = signal(false);
  readonly loadError = signal(false);
  pageIndex = 0;
  pageSize = 10;
  search = '';
  private appliedSearch = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.busy.set(true);
    this.loadingService.start();
    this.loadError.set(false);
    this.service
      .list(this.pageIndex + 1, this.pageSize, this.appliedSearch)
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.loadingService.stop();
        }),
      )
      .subscribe({
        next: (result) => {
          this.plans.set(result.items);
          this.totalCount.set(result.totalCount);
          this.pageIndex = result.pageNumber - 1;
        },
        error: () => this.loadError.set(true),
      });
  }

  applySearch() {
    this.appliedSearch = this.search.trim();
    this.pageIndex = 0;
    this.load();
  }

  changePage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  open(data: MealPlanDialogData) {
    this.dialog
      .open<MealPlanDialog, MealPlanDialogData, boolean>(MealPlanDialog, {
        width: '840px',
        maxWidth: '95vw',
        data,
      })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.snackBar.open('Meal plan saved.', 'Close', { duration: 4000 });
          this.load();
        }
      });
  }

  remove(plan: MealPlanSummary) {
    this.dialog
      .open(ConfirmDialog, {
        width: '350px',
        data: {
          title: 'Delete Meal Plan',
          message: `Delete "${plan.planName}" and all its food items?`,
          icon: '🗑️',
          confirmText: 'Delete',
          cancelText: 'Cancel',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.busy.set(true);
        this.loadingService.start();
        this.service.delete(plan.mealPlanId).subscribe({
          next: () => {
            this.snackBar.open('Meal plan deleted.', 'Close', { duration: 4000 });
            this.load();
          },
          error: () => {
            this.busy.set(false);
            this.loadingService.stop();
            this.snackBar.open('Could not delete meal plan.', 'Close', { duration: 5000 });
          },
        });
      });
  }
}
