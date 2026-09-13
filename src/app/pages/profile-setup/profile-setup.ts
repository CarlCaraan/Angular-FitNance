import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivityLevel } from '../../models/setup/activity-level';
import { ActivityLevelService } from '../../services/setup/activity-level.service';
import { NutritionGoals } from '../../models/setup/nutrition-goals';
import { NutritionGoalsService } from '../../services/setup/nutrition-goals.service';
import { ProfileSetupService } from '../../services/profile-setup/profile-setup.service';
import { ProfileSetupRequest } from '../../models/profile-setup/profile-setup-request';
import confetti from 'canvas-confetti';
import { ChangeDetectorRef } from '@angular/core';
import { CompleteProfileRequest } from '../../models/profile-setup/complete-profile-request';
import { CompleteProfileResponse } from '../../models/profile-setup/complete-profile-response';
import { CompleteProfileService } from '../../services/profile-setup/complete-profile.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialog } from '../../components/dialogs/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-profile-setup',
  imports: [ReactiveFormsModule, MatProgressBarModule],
  templateUrl: './profile-setup.html',
  styleUrl: './profile-setup.css',
})
export class ProfileSetup implements OnInit {
  profileForm: FormGroup;
  activityLevels: ActivityLevel[] = [];
  nutritionGoals: NutritionGoals[] = [];
  isLoading: boolean = false;
  isDarkMode = false;
  themes: any = {
    hacker: {
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      primaryFontColor: '#064E3B',
      secondaryFontColor: '#6B7280',
      accentColor: '#84CC16',
    },

    candy: {
      primaryColor: '#F472B6',
      secondaryColor: '#EC4899',
      primaryFontColor: '#831843',
      secondaryFontColor: '#9D174D',
      accentColor: '#A78BFA',
    },
  };
  // MAGSESEND NG PROFILE SETUP FORM SA BACKEND PARA MAKUHA YUNG PROFILE RESULT
  age: number = -1;
  gender: string = '';
  height: number = -1;
  weight: number = -1;
  bmi: number = -1;
  bmr: number = -1;
  tdee: number = -1;

  calorieAdjustment: number = -1;
  targetCalories: number = -1;
  targetProtein: number = -1;
  targetFat: number = -1;
  targetCarbs: number = -1;
  activityLevelName: string = '';
  goalName: string = '';

  ngOnInit(): void {
    this.loadActivityLevels();
    this.loadNutritionGoals();

    this.setupTheme();
    this.setupColorTheme();
  }

  // =========================
  // CONFETTI
  // =========================

  private launchConfetti(): void {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        x: 0.15,
        y: 0.65,
      },
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        x: 0.85,
        y: 0.65,
      },
    });
  }

  private loadActivityLevels(): void {
    this.activityLevelService.getActivityLevels().subscribe({
      next: (response) => {
        this.activityLevels = response;
      },

      error: (error) => {
        console.error('Failed to load activity levels.', error);
      },
    });
  }

  private loadNutritionGoals(): void {
    this.nutritionGoalsService.getNutritionGoals().subscribe({
      next: (response) => {
        this.nutritionGoals = response;
      },

      error: (error) => {
        console.error('Failed to load nutrition goals.', error);
      },
    });
  }

  private setupTheme(): void {
    const themeControl = this.profileForm.get('themeProfile');

    // Initial theme
    this.updateTheme(themeControl?.value);

    // Kapag nagpalit ng radio button
    themeControl?.valueChanges.subscribe((theme) => {
      this.updateTheme(theme);
    });

    // Listen sa Windows 11 Light/Dark Mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', () => {
      // Update lang kapag System Setting
      if (themeControl?.value === 'system') {
        this.updateTheme('system');
      }
    });
  }

  private updateTheme(theme: string): void {
    if (theme === 'dark') {
      this.isDarkMode = true;

      // Dark mode → white primary font
      this.profileForm.patchValue(
        {
          primaryFontColor: '#FFFFFF',
        },
        {
          emitEvent: false,
        },
      );

      this.applyFormColors();

      return;
    }

    if (theme === 'light') {
      this.isDarkMode = false;

      // Light mode → restore based on selected basic theme
      const selectedTheme = this.profileForm.get('themeBasicProfile')?.value;

      this.applyTheme(selectedTheme);

      return;
    }

    // SYSTEM SETTING
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDarkMode = isDark;

    if (isDark) {
      // System is Dark
      this.profileForm.patchValue(
        {
          primaryFontColor: '#FFFFFF',
        },
        {
          emitEvent: false,
        },
      );

      this.applyFormColors();
    } else {
      // System is Light
      const selectedTheme = this.profileForm.get('themeBasicProfile')?.value;

      this.applyTheme(selectedTheme);
    }
  }

  applyTheme(themeName: string): void {
    const theme = this.themes[themeName];

    if (!theme) {
      return;
    }

    this.profileForm.patchValue(
      {
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,

        // Dark mode → white
        // Light mode → theme default
        primaryFontColor: this.isDarkMode ? '#FFFFFF' : theme.primaryFontColor,

        secondaryFontColor: theme.secondaryFontColor,
        accentColor: theme.accentColor,
      },
      {
        emitEvent: false,
      },
    );

    this.applyFormColors();
  }

  private setupColorTheme(): void {
    const colorControls = [
      'primaryColor',
      'secondaryColor',
      'primaryFontColor',
      'secondaryFontColor',
      'accentColor',
    ];

    colorControls.forEach((controlName) => {
      this.profileForm.get(controlName)?.valueChanges.subscribe(() => {
        this.applyFormColors();
      });
    });

    this.applyFormColors();
  }

  private applyFormColors(): void {
    const themeElement = document.querySelector('.profile-theme') as HTMLElement;

    if (!themeElement) {
      return;
    }

    const primaryColor = this.profileForm.get('primaryColor')?.value;
    const secondaryColor = this.profileForm.get('secondaryColor')?.value;
    const primaryFontColor = this.profileForm.get('primaryFontColor')?.value;
    const secondaryFontColor = this.profileForm.get('secondaryFontColor')?.value;
    const accentColor = this.profileForm.get('accentColor')?.value;

    if (primaryColor) {
      themeElement.style.setProperty('--primary-color', primaryColor);
    }

    if (secondaryColor) {
      themeElement.style.setProperty('--secondary-color', secondaryColor);
    }

    if (primaryFontColor) {
      themeElement.style.setProperty('--text-primary', primaryFontColor);
    }

    if (secondaryFontColor) {
      themeElement.style.setProperty('--text-secondary', secondaryFontColor);
    }

    if (accentColor) {
      themeElement.style.setProperty('--accent-color', accentColor);
    }
  }

  private submitProfileSetup(): void {
    const request: ProfileSetupRequest = {
      birthDate: this.profileForm.get('birthDate')?.value,
      gender: this.profileForm.get('gender')?.value,
      height: this.profileForm.get('height')?.value,
      weight: this.profileForm.get('weight')?.value,
      activityLevelId: this.profileForm.get('activityLevel')?.value,
      goalId: this.profileForm.get('fitnessGoal')?.value,
    };

    this.profileSetupService.computeProfile(request).subscribe({
      next: (result) => {
        console.log('PROFILE RESULT:', result);

        this.age = result.age;
        this.gender = result.gender;
        this.height = result.height;
        this.weight = result.weight;
        this.bmr = result.bmr;
        this.tdee = result.tdee;

        this.calorieAdjustment = result.calorieAdjustment;
        this.targetCalories = result.targetCalories;
        this.targetProtein = result.targetProtein;
        this.targetFat = result.targetFat;
        this.targetCarbs = result.targetCarbs;
        this.activityLevelName = result.activityLevelName;
        this.goalName = result.goalName;

        this.cdr.detectChanges();

        console.log('Target Calories:', this.targetCalories);
        console.log('Activity Level:', this.activityLevelName);
        console.log('Goal:', this.goalName);
      },
      error: (error) => {
        console.error('Profile Setup Error:', error);
      },
    });
  }

  constructor(
    private fb: FormBuilder,
    private activityLevelService: ActivityLevelService,
    private nutritionGoalsService: NutritionGoalsService,
    private profileSetupService: ProfileSetupService,
    private cdr: ChangeDetectorRef,
    private completeProfileService: CompleteProfileService,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.profileForm = this.fb.group({
      // =========================
      // USER INFORMATION
      // =========================

      firstName: ['', Validators.required],

      lastName: ['', Validators.required],

      // Optional
      middleName: [''],

      birthDate: ['', Validators.required],

      // Automatic
      age: [''],

      // Required
      gender: ['', Validators.required],

      // =========================
      // BODY INFORMATION
      // =========================

      // Required - CM
      height: ['', Validators.required],

      // Required - KG
      weight: ['', Validators.required],

      // Automatic
      bmi: [''],

      // Automatic
      bmiStatus: [''],

      // Step 2
      fitnessGoal: ['', Validators.required],

      // Step 3
      activityLevel: ['', Validators.required],

      // Step 4
      monthlyIncome: ['', Validators.required],
      savingsGoal: ['', Validators.required],
      currentSavings: ['', Validators.required],

      // Step 5
      themeProfile: ['light', Validators.required],

      themeBasicProfile: ['hacker', Validators.required],

      colorSetting: ['basic', Validators.required],

      primaryColor: ['#10B981'],

      secondaryColor: ['#059669'],

      primaryFontColor: ['#064E3B'],

      secondaryFontColor: ['#6B7280'],

      accentColor: ['#84CC16'],
    });

    // =========================
    // BASIC SETTINGS → THEME
    // =========================

    this.profileForm.get('themeBasicProfile')?.valueChanges.subscribe((theme) => {
      this.applyTheme(theme);
    });

    const colorControls = [
      'primaryColor',
      'secondaryColor',
      'primaryFontColor',
      'secondaryFontColor',
      'accentColor',
    ];

    colorControls.forEach((controlName) => {
      this.profileForm.get(controlName)?.valueChanges.subscribe(() => {
        this.applyFormColors();
      });
    });

    this.applyTheme(this.profileForm.get('themeBasicProfile')?.value);

    // =========================
    // BIRTH DATE → AGE
    // =========================

    this.profileForm.get('birthDate')?.valueChanges.subscribe((birthDate) => {
      if (!birthDate) {
        this.profileForm.get('age')?.setValue('', {
          emitEvent: false,
        });

        return;
      }

      const age = this.calculateAge(birthDate);

      this.profileForm.get('age')?.setValue(age, {
        emitEvent: false,
      });
    });

    // =========================
    // HEIGHT → BMI
    // =========================

    this.profileForm.get('height')?.valueChanges.subscribe(() => {
      this.calculateBMI();
    });

    // =========================
    // WEIGHT → BMI
    // =========================

    this.profileForm.get('weight')?.valueChanges.subscribe(() => {
      this.calculateBMI();
    });
  }

  // ==========================================
  // NEXT STEP
  // ==========================================

  // Current step of the profile setup wizard
  currentStep = 1;

  // ==========================================
  // NEXT STEP
  // ==========================================

  nextStep(): void {
    // =========================
    // STEP 1 - USER INFO
    // =========================
    if (this.currentStep === 1) {
      const fields = ['firstName', 'lastName', 'birthDate', 'gender', 'height', 'weight'];

      fields.forEach((field) => {
        this.profileForm.get(field)?.markAsTouched();
      });

      if (fields.some((field) => this.profileForm.get(field)?.invalid)) {
        return;
      }
    }

    // =========================
    // STEP 2 - FITNESS GOAL
    // =========================
    if (this.currentStep === 2) {
      const fitnessGoal = this.profileForm.get('fitnessGoal');

      fitnessGoal?.markAsTouched();

      if (fitnessGoal?.invalid) {
        return;
      }
    }

    // =========================
    // STEP 3 - ACTIVITY LEVEL
    // =========================
    if (this.currentStep === 3) {
      const activityLevel = this.profileForm.get('activityLevel');

      activityLevel?.markAsTouched();

      if (activityLevel?.invalid) {
        return;
      }
    }

    // =========================
    // STEP 4 - FINANCE GOAL
    // =========================
    if (this.currentStep === 4) {
      const fields = ['monthlyIncome', 'savingsGoal', 'currentSavings'];

      fields.forEach((field) => {
        this.profileForm.get(field)?.markAsTouched();
      });

      if (fields.some((field) => this.profileForm.get(field)?.invalid)) {
        return;
      }
    }

    // =========================
    // STEP 5 - THEME SETTINGS
    // =========================

    if (this.currentStep === 5) {
      const fields = ['themeProfile', 'colorSetting'];

      fields.forEach((field) => {
        this.profileForm.get(field)?.markAsTouched();
      });

      if (fields.some((field) => this.profileForm.get(field)?.invalid)) {
        return;
      }
    }

    // =========================
    // STEP 6 - COMPLETE PROFILE
    // =========================
    if (this.currentStep === 6) {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '400px',
        disableClose: true,
        data: {
          title: 'Complete Profile?',
          message: 'Are you sure you want to complete your profile?',
          icon: '🎉',
          confirmText: 'Proceed to Dashboard',
          cancelText: 'Edit',
        },
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.completeProfile();
        }
      });
    }

    // =========================
    // MOVE TO NEXT STEP
    // =========================
    if (this.currentStep < 6) {
      this.currentStep++;

      // Launch confetti when reaching the last step
      if (this.currentStep === 6) {
        setTimeout(() => {
          this.launchConfetti();
        }, 150);

        //Get the profile setup result from backend PROC_ProfileSetupResult
        this.submitProfileSetup();
      }
    }
  }

  // ==========================================
  // PREVIOUS STEP
  // ==========================================

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // ==========================================
  // CALCULATE AGE
  // ==========================================

  private calculateAge(birthDate: string): number {
    const today = new Date();

    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference = today.getMonth() - birth.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  // ==========================================
  // CALCULATE BMI
  // ==========================================

  private calculateBMI(): void {
    const height = Number(this.profileForm.get('height')?.value);

    const weight = Number(this.profileForm.get('weight')?.value);

    // No BMI if height or weight
    // is missing or invalid.
    if (!height || !weight || height <= 0 || weight <= 0) {
      this.profileForm.get('bmi')?.setValue('', {
        emitEvent: false,
      });

      this.profileForm.get('bmiStatus')?.setValue('', {
        emitEvent: false,
      });

      return;
    }

    // CM → METERS
    const heightInMeters = height / 100;

    // BMI Formula
    const bmi = weight / (heightInMeters * heightInMeters);

    // Round to 1 decimal
    const roundedBMI = Number(bmi.toFixed(1));

    // Get BMI Status
    const status = this.getBMIStatus(roundedBMI);

    // Set BMI
    this.profileForm.get('bmi')?.setValue(roundedBMI, {
      emitEvent: false,
    });

    // Set BMI Status
    this.profileForm.get('bmiStatus')?.setValue(status, {
      emitEvent: false,
    });
  }

  // ==========================================
  // BMI STATUS
  // ==========================================

  private getBMIStatus(bmi: number): string {
    if (bmi <= 16.0) {
      return 'Severely Underweight';
    }

    if (bmi <= 18.5) {
      return 'Underweight';
    }

    if (bmi <= 25.0) {
      return 'Normal';
    }

    if (bmi <= 30.0) {
      return 'Overweight';
    }

    if (bmi <= 35.0) {
      return 'Obese';
    }

    return 'Above Range';
  }

  private completeProfile(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    const request: CompleteProfileRequest = {
      birthdate: this.profileForm.value.birthDate,
      age: this.profileForm.value.age,
      gender: this.profileForm.value.gender,

      height: this.profileForm.value.height,
      weight: this.profileForm.value.weight,
      currentBMI: this.profileForm.value.bmi,

      activityLevelId: this.profileForm.value.activityLevel,
      fitnessGoalId: this.profileForm.value.fitnessGoal,

      monthlyIncome: this.profileForm.value.monthlyIncome,
      savingsGoal: this.profileForm.value.savingsGoal,
      currentSavings: this.profileForm.value.currentSavings,

      bmr: this.bmr,
      tdee: this.tdee,

      targetCalories: this.targetCalories,
      targetProtein: this.targetProtein,
      targetCarbs: this.targetCarbs,
      targetFat: this.targetFat,

      firstName: this.profileForm.value.firstName,
      middleName: this.profileForm.value.middleName,
      lastName: this.profileForm.value.lastName,

      themeMode: this.profileForm.value.themeProfile,
      primaryColor: this.profileForm.value.primaryColor,
      secondaryColor: this.profileForm.value.secondaryColor,
      primaryFontColor: this.profileForm.value.primaryFontColor,
      secondaryFontColor: this.profileForm.value.secondaryFontColor,
      accentColor: this.profileForm.value.accentColor,
    };

    console.log(request);

    this.completeProfileService.completeProfile(request).subscribe({
      next: (response: CompleteProfileResponse) => {
        this.isLoading = false;
        console.log(response.message);

        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error(error);
        console.error('Status:', error.status);
        console.error('Response:', error.error);
        console.error('Message:', error.message);
      },
    });
  }
}
