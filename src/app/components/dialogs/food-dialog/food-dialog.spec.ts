import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { FoodDialog } from './food-dialog';

describe('FoodDialog', () => {
  let component: FoodDialog;
  let fixture: ComponentFixture<FoodDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodDialog],
      providers: [
        provideHttpClient(),
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
