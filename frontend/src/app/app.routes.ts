import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from '../app/core/services/auth/auth.guard';
import { AppRoutesPaths } from './shared/app.constants';

export const routes: Routes = [
  /** 
   * Public login routes
   */
  {
    path: AppRoutesPaths.LOGIN,
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: AppRoutesPaths.FORGOT_PASSWORD,
    loadComponent: () => import('./pages/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: AppRoutesPaths.REGISTER,
    loadComponent: () => import('./pages/register/register.component')
      .then(m => m.RegisterComponent)
  },
  
  // Public dashboard route
  {
    path: AppRoutesPaths.DASHBOARD,
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('../app/pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      }
    ]   
  },

  // Always redirect to dashboard if no path is provided
  { path: '', redirectTo: AppRoutesPaths.DASHBOARD, pathMatch: 'full' },

  // Protected routes under Layout
  {
    path: '',
    component: LayoutComponent,
    // Comment out the AuthGuard to test the routes
    canActivate: [AuthGuard],
    children: [
      {
        path: AppRoutesPaths.ACCOUNT,
        loadComponent: () => import('../app/pages/account/account.component')
          .then(m => m.AccountComponent)
      },
      {
        path: AppRoutesPaths.CALENDAR,
        loadComponent: () => import('../app/pages/calendar/calendar.component')
          .then(m => m.CalendarComponent)
      },
      {
        path: AppRoutesPaths.MAP,
        loadComponent: () => import('../app/pages/map/map.component')
          .then(m => m.MapComponent)
      },
      {
        path: AppRoutesPaths.DONATION_INFO,
        loadComponent: () => import('../app/pages/donation-info/donation-info.component')
          .then(c => c.DonationInfoComponent)
      },
      {
        path: AppRoutesPaths.QUESTIONNAIRE,
        loadComponent: () => import('../app/pages/questionnaire/questionnaire.component')
          .then(m => m.QuestionnaireComponent)
      },
      {
        path: AppRoutesPaths.REWARDS,
        loadComponent: () => import('../app/pages/rewards/rewards.component')
          .then(m => m.RewardsComponent)
      },
      {
        path: AppRoutesPaths.SCRT,
        loadComponent: () => import('../app/pages/scrt/scrt.component')
          .then(m => m.ScrtComponent)
      }
    ]
  },

  // Fallback for unknown routes
  { path: '**', redirectTo: AppRoutesPaths.DASHBOARD }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'top',
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}