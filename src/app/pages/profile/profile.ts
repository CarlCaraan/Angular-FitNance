import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ProfileService } from '../../services/profile/profile.service';
import { UserProfile } from '../../models/profile/profile';

import { ActivityLevelService } from '../../services/setup/activity-level.service';
import { NutritionGoalsService } from '../../services/setup/nutrition-goals.service';

import { ActivityLevel } from '../../models/setup/activity-level';
import { NutritionGoals } from '../../models/setup/nutrition-goals';

import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ComputeProfileRequest } from '../../models/profile/compute-profile-request';
import { ComputeProfileResponse } from '../../models/profile/compute-profile-response';
import { AuthService } from '../../services/authentication/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profileForm!: FormGroup;

  profile: UserProfile | null = null;

  isLoading = false;

  activityLevels: ActivityLevel[] = [];
  nutritionGoals: NutritionGoals[] = [];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private activityLevelService: ActivityLevelService,
    private nutritionGoalsService: NutritionGoalsService,
    private authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      // ==========================================
      // USER INFORMATION
      // ==========================================

      userProfileId: [{ value: '', disabled: true }],
      birthdate: [{ value: '', disabled: true }],
      age: [{ value: '', disabled: true }],
      gender: [{ value: '', disabled: true }],

      firstName: [''],
      middleName: [''],
      lastName: [''],

      // ==========================================
      // BODY INFORMATION
      // ==========================================

      height: [''],
      weight: [''],

      currentBMI: [{ value: '', disabled: true }],

      activityLevelId: [{ value: '', disabled: true }],

      fitnessGoalId: [''],

      // ==========================================
      // FINANCE
      // ==========================================

      monthlyIncome: [''],
      savingsGoal: [''],
      currentSavings: [''],

      // ==========================================
      // NUTRITION TARGET
      // ==========================================

      targetCalories: [{ value: '', disabled: true }],
      targetProtein: [{ value: '', disabled: true }],
      targetCarbs: [{ value: '', disabled: true }],
      targetFat: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.initializeForm();

    this.setupComputeTargets();

    this.loadProfile();
    this.loadActivityLevels();
    this.loadNutritionGoals();
  }

  // =========================
  // INITIALIZE FORM
  // =========================

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      // =========================
      // NOT EDITABLE
      // =========================

      userProfileId: [{ value: '', disabled: true }],

      birthdate: [{ value: '', disabled: true }],

      age: [{ value: '', disabled: true }],

      gender: [{ value: '', disabled: true }],

      currentBMI: [{ value: '', disabled: true }],

      activityLevelId: [{ value: '', disabled: true }],

      targetCalories: [{ value: '', disabled: true }],

      targetProtein: [{ value: '', disabled: true }],

      targetCarbs: [{ value: '', disabled: true }],

      targetFat: [{ value: '', disabled: true }],

      // =========================
      // EDITABLE
      // =========================

      height: [''],

      weight: [''],

      fitnessGoalId: [''],

      monthlyIncome: [''],

      savingsGoal: [''],

      currentSavings: [''],

      firstName: [''],

      middleName: [''],

      lastName: [''],
    });
  }

  // =========================
  // LOAD PROFILE
  // =========================

  private loadProfile(): void {
    // Get logged-in username from AuthService
    const username = this.authService.getUsername();

    if (!username) {
      console.error('Username not found.');
      return;
    }

    console.log('Loading profile for:', username);

    this.isLoading = true;

    this.profileService.getProfile(username).subscribe({
      next: (profile: UserProfile) => {
        console.log('PROFILE:', profile);

        this.profile = profile;

        this.profileForm.patchValue({
          userProfileId: profile.userProfileId,
          birthdate: this.formatDate(profile.birthdate),
          age: profile.age,
          gender: profile.gender,

          height: profile.height,
          weight: profile.weight,

          currentBMI: profile.currentBMI,

          activityLevelId: profile.activityLevelId,
          fitnessGoalId: profile.fitnessGoalId,

          monthlyIncome: profile.monthlyIncome,
          savingsGoal: profile.savingsGoal,
          currentSavings: profile.currentSavings,

          targetCalories: profile.targetCalories,
          targetProtein: profile.targetProtein,
          targetCarbs: profile.targetCarbs,
          targetFat: profile.targetFat,

          firstName: profile.firstName,
          middleName: profile.middleName,
          lastName: profile.lastName,
        });

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Failed to load profile:', error);

        this.isLoading = false;
      },
    });
  }

  // =========================
  // FORMAT DATE
  // =========================

  private formatDate(date: string): string {
    if (!date) {
      return '';
    }

    return date.substring(0, 10);
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

  // ==========================================
  // SETUP COMPUTE TARGETS
  // ==========================================

  private setupComputeTargets(): void {
    // Height
    this.profileForm
      .get('height')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.computeTargets();
      });

    // Weight
    this.profileForm
      .get('weight')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.computeTargets();
      });

    // Fitness Goal
    this.profileForm
      .get('fitnessGoalId')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.computeTargets();
      });
  }

  // ==========================================
  // COMPUTE PROFILE TARGETS
  // ==========================================

  private computeTargets(): void {
    const height = this.profileForm.get('height')?.value;
    const weight = this.profileForm.get('weight')?.value;
    const gender = this.profileForm.get('gender')?.value;
    const birthdate = this.profileForm.get('birthdate')?.value;
    const activityLevelId = this.profileForm.get('activityLevelId')?.value;
    const goalId = this.profileForm.get('fitnessGoalId')?.value;

    // Don't call API if required values are missing
    if (!birthdate || !gender || !height || !weight || !activityLevelId || !goalId) {
      return;
    }

    const request: ComputeProfileRequest = {
      birthDate: birthdate,

      gender: gender,

      height: Number(height),

      weight: Number(weight),

      activityLevelId: activityLevelId,

      goalId: goalId,
    };

    console.log('COMPUTE PROFILE REQUEST:', request);

    this.isLoading = true;

    this.profileService.computeTargets(request).subscribe({
      next: (response: ComputeProfileResponse) => {
        console.log('COMPUTE PROFILE RESPONSE:', response);

        // ==========================================
        // UPDATE FORM WITH API RESPONSE
        // ==========================================

        this.profileForm.patchValue({
          age: response.age,

          gender: response.gender,

          height: response.height,

          weight: response.weight,

          currentBMI: this.calculateBMI(response.height, response.weight),

          targetCalories: response.targetCalories,

          targetProtein: response.targetProtein,

          targetFat: response.targetFat,

          targetCarbs: response.targetCarbs,
        });

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Failed to compute profile targets.', error);

        this.isLoading = false;
      },
    });
  }

  // ==========================================
  // CALCULATE BMI
  // ==========================================

  private calculateBMI(height: number, weight: number): number {
    if (!height || !weight) {
      return 0;
    }

    const heightInMeters = height / 100;

    return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
  }

  // =========================
  // SAVE / UPDATE
  // =========================

  saveProfile(): void {
    // getRawValue() para makuha pati
    // disabled fields kung kailangan later.
    const formValue = this.profileForm.getRawValue();

    console.log('PROFILE FORM:', formValue);

    // Dito natin ilalagay later ang
    // updateProfile() API call.
  }
}
