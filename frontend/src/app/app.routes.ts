import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from '../app/core/services/auth/auth.guard';

export const routes: Routes = [
  /** 
   * Public login routes
   */
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'forgotPassword',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component')
      .then(m => m.RegisterComponent)
  },
  
  // Public dashboard route
  {
    path: 'dashboard',
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
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Protected routes under Layout
  {
    path: '',
    component: LayoutComponent,
    // Comment out the AuthGuard to test the routes
    //canActivate: [AuthGuard],
    children: [
      {
        path: 'account',
        loadComponent: () => import('../app/pages/account/account.component')
          .then(m => m.AccountComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('../app/pages/calendar/calendar.component')
          .then(m => m.CalendarComponent)
      },
      {
        path: 'map',
        loadComponent: () => import('../app/pages/map/map.component')
          .then(m => m.MapComponent)
      },
      {
        path: 'questionnaire',
        loadComponent: () => import('../app/pages/questionnaire/questionnaire.component')
          .then(m => m.QuestionnaireComponent)
      },
      {
        path: 'segredinho',
        loadComponent: () => import('../app/pages/scrt/scrt.component')
          .then(m => m.ScrtComponent)
      }
    ]
  },

  // Fallback for unknown routes
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'top',
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
