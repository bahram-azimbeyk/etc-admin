import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './authenticate/components';
import { AuthGuard } from './authenticate/services';
import {
  AdminComponent,
  BlogComponent,
  NavigatorComponent,
  SchemaComponent,
} from './core/components';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        children: [
          {
            path: 'window/:id',
            component: NavigatorComponent,
            data: { mode: 'window' },
          },
          {
            path: 'schema/:id',
            component: SchemaComponent,
            data: { mode: 'schema' },
          },
          {
            path: 'blog/:slug',
            component: BlogComponent,
            data: { mode: 'blog' },
          },
        ],
      },
    ],
  },
  { path: 'signin', component: SigninComponent },
  { path: ':mode', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
