import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { FooterComponent } from './footer.component';
import { LinksComponent } from './components/links/links.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';

@NgModule({
    declarations: [
        FooterComponent,
        LinksComponent,
        NewsletterComponent,
    ],
    exports: [
        FooterComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule.forChild(),
        SharedModule,
    ],
})
export class FooterModule { }
