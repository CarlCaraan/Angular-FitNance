import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FoodDialog } from './food-dialog';

describe('FoodDialog', () => {
  let component: FoodDialog;
  let fixture: ComponentFixture<FoodDialog>;

  beforeEach(async () => {
    // ==========================================
    // MOCK MATCH MEDIA
    // ==========================================
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,

        addListener: () => {},
        removeListener: () => {},

        addEventListener: () => {},
        removeEventListener: () => {},

        dispatchEvent: () => false,
      }),
    });

    // ==========================================
    // CONFIGURE TEST BED
    // ==========================================
    await TestBed.configureTestingModule({
      imports: [FoodDialog],

      providers: [
        provideHttpClient(),

        // ==========================================
        // MOCK DIALOG DATA
        // ==========================================
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'add',
          },
        },

        // ==========================================
        // MOCK DIALOG REF
        // ==========================================
        {
          provide: MatDialogRef,
          useValue: {
            close: () => undefined,
          },
        },
      ],
    }).compileComponents();

    // ==========================================
    // CREATE COMPONENT
    // ==========================================
    fixture = TestBed.createComponent(FoodDialog);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  // ==========================================
  // CREATE TEST
  // ==========================================
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
