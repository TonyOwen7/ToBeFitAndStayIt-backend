// app.routes.ts or app.config.ts
import { Routes } from '@angular/router';
import { NutritionComponent } from './features/nutrition/nutrition.component';
import { HydrationComponent } from './features/hydration/hydration.component';
import { SleepComponent } from './features/sleep/sleep.component';
import { AppComponent } from './app.component';
import { MetabolismComponent } from './features/metabolism/metabolism.component';
import { HomeComponent } from './core/components/home/home.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
  { path: 'nutrition', component: NutritionComponent },
  { path: 'hydration', component: HydrationComponent },
  { path: 'sleep', component: SleepComponent },
  { path: 'metabolism', component: MetabolismComponent },
  { path: 'home', component : HomeComponent },
  { path: 'register', component: RegisterComponent }, // Main app component route
  { path: '', redirectTo: '/home', pathMatch: 'full' } // Redirect to home on empty path,
];
