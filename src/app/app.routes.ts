// app.routes.ts or app.config.ts
import { Routes } from '@angular/router';
import { NutritionComponent } from './features/nutrition/nutrition.component';
import { HydrationComponent } from './features/hydration/hydration.component';
import { SleepComponent } from './features/sleep/sleep.component';
import { AppComponent } from './app.component';
import { MetabolismComponent } from './features/metabolism/metabolism.component';
import { HomeComponent } from './core/components/home/home.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginModalComponent } from './auth/login-modal/login-modal.component';
import { AboutComponent } from './features/about/about.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'nutrition', component: NutritionComponent },
  { path: 'hydration', component: HydrationComponent },
  { path: 'sleep', component: SleepComponent },
  { path: 'metabolism', component: MetabolismComponent },
  { path: 'home', component : HomeComponent },
  { path: 'login', component: LoginModalComponent }, 
  { path: 'forgot-password', component: ForgotPasswordComponent }, 
  { path: 'reset-password/:uid/:token', component: ResetPasswordComponent },
  { path: 'register', component: RegisterComponent }, 
  { path: 'about', component: AboutComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' } // Redirect to home on empty path,
];
