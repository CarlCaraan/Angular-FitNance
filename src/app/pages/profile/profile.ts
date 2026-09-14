import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ProfileService } from '../../services/profile/profile.service';
import { UserProfile } from '../../models/profile/profile';

import { ActivityLevelService } from '../../services/setup/activity-level.service';
import { NutritionGoalsService } from '../../services/setup/nutrition-goals.service';

import { ActivityLevel } from '../../models/setup/activity-level';
import { NutritionGoals } from '../../models/setup/nutrition-goals';

import { debounceTime, distinctUntilChanged, finalize, forkJoin, tap } from 'rxjs';

import { ComputeProfileRequest } from '../../models/profile/compute-profile-request';
import { ComputeProfileResponse } from '../../models/profile/compute-profile-response';
import { AuthService } from '../../services/authentication/auth.service';
import { LoadingService } from '../../services/loading/loading.service';
import { UpdateProfileRequest } from '../../models/profile/update-profile-request';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../components/dialogs/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  activityLevels: ActivityLevel[] = [];
  nutritionGoals: NutritionGoals[] = [];

  profileForm!: FormGroup;

  profile: UserProfile | null = null;
  isSaving = false;
  public showSaved = signal(false);

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private activityLevelService: ActivityLevelService,
    private nutritionGoalsService: NutritionGoalsService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private dialog: MatDialog,
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
    // this.loadActivityLevels();
    // this.loadNutritionGoals();

    forkJoin({
      activityLevels: this.loadActivityLevels(),
      nutritionGoals: this.loadNutritionGoals(),
    }).subscribe(() => {
      this.loadProfile();
    });

    // this.loadProfile();
  }

  loadActivityLevels() {
    return this.activityLevelService.getActivityLevels().pipe(
      tap((data) => {
        this.activityLevels = data;
      }),
    );
  }

  loadNutritionGoals() {
    return this.nutritionGoalsService.getNutritionGoals().pipe(
      tap((data) => {
        this.nutritionGoals = data;
      }),
    );
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

    // ==========================================
    // START GLOBAL LOADING
    // ==========================================
    this.loadingService.start();

    this.profileService.getProfile(username).subscribe({
      next: (profile: UserProfile) => {
        console.log('PROFILE:', profile);

        this.profile = profile;

        this.profileForm.patchValue(
          {
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
          },
          {
            emitEvent: false,
          },
        );

        // ==========================================
        // STOP GLOBAL LOADING
        // ==========================================

        this.loadingService.stop();
      },

      error: (error) => {
        console.error('Failed to load profile:', error);

        // ==========================================
        // STOP GLOBAL LOADING
        // ==========================================

        this.loadingService.stop();
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

  // private loadActivityLevels(): void {
  //   this.activityLevelService.getActivityLevels().subscribe({
  //     next: (response) => {
  //       this.activityLevels = response;
  //     },

  //     error: (error) => {
  //       console.error('Failed to load activity levels.', error);
  //     },
  //   });
  // }

  // private loadNutritionGoals(): void {
  //   this.nutritionGoalsService.getNutritionGoals().subscribe({
  //     next: (response) => {
  //       this.nutritionGoals = response;
  //     },

  //     error: (error) => {
  //       console.error('Failed to load nutrition goals.', error);
  //     },
  //   });
  // }

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

    // ==========================================
    // VALIDATE REQUIRED VALUES
    // ==========================================

    if (!birthdate || !gender || !height || !weight || !activityLevelId || !goalId) {
      return;
    }

    // ==========================================
    // COMPUTE PROFILE REQUEST
    // ==========================================

    const request: ComputeProfileRequest = {
      birthDate: birthdate,
      gender: gender,
      height: Number(height),
      weight: Number(weight),
      activityLevelId: activityLevelId,
      goalId: goalId,
    };

    console.log('COMPUTE PROFILE REQUEST:', request);

    // ==========================================
    // START GLOBAL LOADING
    // ==========================================

    this.loadingService.start();

    // ==========================================
    // CALL COMPUTE API
    // ==========================================

    this.profileService.computeTargets(request).subscribe({
      next: (response: ComputeProfileResponse) => {
        console.log('COMPUTE PROFILE RESPONSE:', response);

        // ==========================================
        // UPDATE FORM WITH API RESPONSE
        // ==========================================
        this.profileForm.patchValue(
          {
            age: response.age,

            gender: response.gender,

            height: response.height,

            weight: response.weight,

            currentBMI: this.calculateBMI(response.height, response.weight),

            targetCalories: response.targetCalories,

            targetProtein: response.targetProtein,

            targetFat: response.targetFat,

            targetCarbs: response.targetCarbs,
          },
          {
            emitEvent: false,
          },
        );

        // ==========================================
        // STOP GLOBAL LOADING
        // ==========================================

        this.loadingService.stop();
      },

      error: (error) => {
        console.error('Failed to compute profile targets.', error);

        // ==========================================
        // STOP GLOBAL LOADING
        // ==========================================

        this.loadingService.stop();
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

  // =========================
  // SAVE / UPDATE
  // =========================

  saveProfile(): void {
    // Get raw form values.
    // getRawValue() para makuha pati disabled fields kung kailangan later.
    const formValue = this.profileForm.getRawValue();
    const username = this.authService.getUsername();

    // Siguraduhin na may username bago magpatuloy.
    if (!username) {
      console.error('Username not found.');
      return;
    }

    console.log('PROFILE FORM:', formValue);

    const request: UpdateProfileRequest = {
      birthdate: formValue.birthdate,
      age: formValue.age,
      gender: formValue.gender,

      height: formValue.height,
      weight: formValue.weight,
      currentBMI: formValue.currentBMI,

      activityLevelId: formValue.activityLevelId,
      fitnessGoalId: formValue.fitnessGoalId,

      monthlyIncome: formValue.monthlyIncome,
      savingsGoal: formValue.savingsGoal,
      currentSavings: formValue.currentSavings,

      targetCalories: formValue.targetCalories,
      targetProtein: formValue.targetProtein,
      targetCarbs: formValue.targetCarbs,
      targetFat: formValue.targetFat,

      firstName: formValue.firstName,
      middleName: formValue.middleName,
      lastName: formValue.lastName,
    };

    console.log('UPDATE PROFILE REQUEST:', request);

    // Ipakita muna ang confirmation dialog bago baguhin ang profile.
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Update Profile?',
        message: 'Are you sure you want to save these changes to your profile?',
        icon: '👤',
        confirmText: 'Update Profile',
        cancelText: 'Cancel',
      },
    });

    // Hintayin kung pinindot ng user ang Confirm o Cancel.
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      // Kapag Cancel, walang gagawin.
      if (!confirmed) {
        return;
      }

      // Kapag Confirm, saka lang tatawagin ang API.
      this.submitUpdateProfile(username, request);
    });
  }

  // =========================
  // SUBMIT UPDATE PROFILE
  // =========================

  private submitUpdateProfile(username: string, request: UpdateProfileRequest): void {
    // ==========================================
    // START GLOBAL LOADING
    // ==========================================

    this.loadingService.start();

    this.profileService
      .updateProfile(username, request)
      .pipe(
        finalize(() => {
          // ==========================================
          // STOP GLOBAL LOADING
          // ==========================================

          this.loadingService.stop();
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('PROFILE UPDATED:', response);
          // ==========================================
          // SHOW SAVED MESSAGE
          // ==========================================

          this.showSaved.set(true);

          // ==========================================
          // HIDE SAVED MESSAGE AFTER 2.5 SECONDS
          // ==========================================

          setTimeout(() => {
            this.showSaved.set(false);
          }, 2500);
        },

        error: (error) => {
          console.error('UPDATE PROFILE ERROR:', error);
        },
      });
  }
}
