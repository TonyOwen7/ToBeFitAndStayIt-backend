// app.routes.ts or app.config.ts
import { Routes } from '@angular/router';
import { NutritionComponent } from './features/nutrition/nutrition.component';
import { HydrationComponent } from './features/hydration/hydration.component';
import { SleepComponent } from './features/sleep/sleep.component';
import { MetabolismComponent } from './features/metabolism/metabolism.component';
import { HomeComponent } from './core/components/home/home.component';
import { AboutComponent } from './features/about/about.component';

import { RegisterComponent } from './auth/register/register.component';
import { LoginModalComponent } from './auth/login-modal/login-modal.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { TermsPrivacyComponent } from './auth/register/terms-privacy/terms-privacy/terms-privacy.component';
import { SettingsComponent } from './core/components/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default redirect
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'settings', component: SettingsComponent },


  // Features
  { path: 'nutrition', component: NutritionComponent },
  { path: 'hydration', component: HydrationComponent },
  { path: 'sleep', component: SleepComponent },
  { path: 'metabolism', component: MetabolismComponent },

  // Auth section
  {
    path: 'auth',
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:uid/:token', component: ResetPasswordComponent },
    ]
  },

  // Legal
  { path: 'terms-privacy', component: TermsPrivacyComponent },

  // Wildcard fallback
  { path: '**', redirectTo: '/home' }
];
