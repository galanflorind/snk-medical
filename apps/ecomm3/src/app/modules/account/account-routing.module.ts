import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { PageAddressesComponent } from './pages/page-addresses/page-addresses.component';
import { PageDashboardComponent } from './pages/page-dashboard/page-dashboard.component';
import { PageEditAddressComponent } from './pages/page-edit-address/page-edit-address.component';
import { PageLoginComponent } from './pages/page-login/page-login.component';
import { PageInvoicesComponent } from './pages/page-invoices/page-invoices.component';
import { PagePasswordComponent } from './pages/page-password/page-password.component';
import { PageProfileComponent } from './pages/page-profile/page-profile.component';
import { PageRegisterComponent } from "./pages/page-register/page-register.component";
import { NaoUserPermissionsGuard } from "@naologic/nao-user-access";
import { PageForgotPasswordComponent } from "./pages/page-forgot-password/page-forgot-password.component";

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard',
            },
            {
                path: 'dashboard',
                component: PageDashboardComponent,
            },

            {
                path: 'profile',
                component: PageProfileComponent,
            },
            {
                path: 'invoices',
                component: PageInvoicesComponent,
            },
            {
                path: 'addresses',
                component: PageAddressesComponent,
            },
            {
                path: 'addresses/new',
                component: PageEditAddressComponent,
            },
            {
                path: 'addresses/:id',
                component: PageEditAddressComponent,
            },
            {
                path: 'password',
                component: PagePasswordComponent,
            },
        ],
        canActivate: [NaoUserPermissionsGuard]
    },
    {
        path: 'login',
        component: PageLoginComponent,
        // canActivate: [AuthGuard],
        // data: {
        //     authGuardMode: 'redirectToDashboard',
        // },
    },
    {
        path: 'register',
        component: PageRegisterComponent,
        // canActivate: [AuthGuard],
        // data: {
        //     authGuardMode: 'redirectToDashboard',
        // },
    },
    // todo: uncomment this when we have the API ready for forgot password
    // {
    //     path: 'forgot-password',
    //     component: PageForgotPasswordComponent,
    //     // canActivate: [AuthGuard],
    //     // data: {
    //     //     authGuardMode: 'redirectToDashboard',
    //     // },
    // },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AccountRoutingModule { }
