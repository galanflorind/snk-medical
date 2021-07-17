import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LayoutComponent } from './components/layout/layout.component';
import { PageAddressesComponent } from './pages/page-addresses/page-addresses.component';
import { PageDashboardComponent } from './pages/page-dashboard/page-dashboard.component';
import { PageEditAddressComponent } from './pages/page-edit-address/page-edit-address.component';
import { PageLoginComponent } from './pages/page-login/page-login.component';
import { PageInvoicesComponent } from './pages/page-invoices/page-invoices.component';
import { PagePasswordComponent } from './pages/page-password/page-password.component';
import { PageProfileComponent } from './pages/page-profile/page-profile.component';
import { PageRegisterComponent } from "./pages/page-register/page-register.component";
import { PageForgotPasswordComponent } from "./pages/page-forgot-password/page-forgot-password.component";
//component

@NgModule({
    declarations: [
        LayoutComponent,
        PageAddressesComponent,
        PageDashboardComponent,
        PageEditAddressComponent,
        PageLoginComponent,
        PageInvoicesComponent,
        PagePasswordComponent,
        PageProfileComponent,
        PageRegisterComponent,
        PageForgotPasswordComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        AccountRoutingModule,
        SharedModule,
    ],
})
export class AccountModule { }
