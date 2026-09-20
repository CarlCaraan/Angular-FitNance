import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-food-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './food-dialog.html',
  styleUrl: './food-dialog.css',
})
export class FoodDialog {}
