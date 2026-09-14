import { Routes } from '@angular/router';

import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';

import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/profile/profile';
import { Settings } from './pages/settings/settings';
import { ProfileSetup } from './pages/profile-setup/profile-setup';
import { Food } from './pages/food/food';
import { Workout } from './pages/workout/workout';

import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  // ==========================================
  // DEFAULT ROUTE
  // ==========================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'register',
    component: Register,
  },

  // ==========================================
  // MAIN APPLICATION
  // ==========================================

  {
    path: '',
    component: MainLayout,

    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'food',
        component: Food,
      },
      {
        path: 'workout',
        component: Workout,
      },
      {
        path: 'profile',
        component: Profile,
      },
      {
        path: 'settings',
        component: Settings,
      },
    ],
  },

  // ==========================================
  // PROFILE SETUP
  // ==========================================

  {
    path: 'profile-setup',
    component: ProfileSetup,
  },
];
