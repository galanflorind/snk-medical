import { NgModule } from '@angular/core';
import { filter } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';
import { Router, Scroll, Event } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AppRoutingModule } from './app-routing.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { FakeApiModule } from './api';
import { FooterModule } from './modules/footer/footer.module';
import { HeaderModule } from './modules/header/header.module';
import { LanguageModule } from './modules/language/language.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { SharedModule } from './modules/shared/shared.module';
import { AppComponent } from './app.component';
import { RootComponent } from './components/root/root.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { NaoHttp2Module } from "@naologic/nao-http2";
import { environment } from '../environments/environment';
import { ECommerceService } from "./e-commerce.service";
import { AppService } from "./app.service";
import { PageShopService } from "./modules/shop/services/page-shop.service";
import { NaoUserAccessModule } from "@naologic/nao-user-access";
import { ActiveCountryList, ActiveCurrencyList, ActiveLanguageList } from "./app.locale";
import { NaoLocaleModule } from "@naologic/nao-locale";
import {NaoUsersAuthService} from "./services/nao-users-auth.service";
import {UserProfileService} from "./services/users-profile.service";

@NgModule({
    declarations: [
        // components
        AppComponent,
        RootComponent,
        // pages
        PageNotFoundComponent,
    ],
    imports: [
        // modules (angular)
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        // modules (third-party)
        ModalModule.forRoot(),
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-left',
        }),
        TooltipModule.forRoot(),
        TranslateModule.forChild(),


        NaoHttp2Module.forRoot(environment.API),
        NaoUserAccessModule.forRoot(environment.naoUsers),
        NaoLocaleModule.forRoot({
            activeCountryList: ActiveCountryList,
            activeCurrencyList: ActiveCurrencyList,
            activeLanguageList: ActiveLanguageList,
            defaultCountry: 'USA',
            defaultCurrency: 'USD',
            defaultLanguage: 'en-us',
            defaultLocaleDate: 'en-ie'
        }),


        // modules
        AppRoutingModule,
        // todo: remove this and use or locale???
        // todo: remove this and use or locale???
        // todo: remove this and use or locale???
        // todo: remove this and use or locale???
        CurrencyModule.config({
            default: 'USD',
            currencies: [
                {
                    symbol: '$',
                    name: 'US Dollar',
                    code: 'USD',
                    rate: 1,
                }
            ],
        }),
        FakeApiModule,
        FooterModule,
        HeaderModule,
        // todo: remove and use our type of language files?
        LanguageModule.config({
            default: 'en',
            languages: [
                {
                    code: 'en',
                    name: 'English',
                    image: 'assets/images/languages/language-1.png',
                    direction: 'ltr',
                },
                {
                    code: 'ru',
                    name: 'Russian',
                    image: 'assets/images/languages/language-2.png',
                    direction: 'ltr',
                },
                {
                    code: 'en-RTL',
                    name: 'RTL',
                    image: 'assets/images/languages/language-3.png',
                    direction: 'rtl',
                },
            ],
        }),
        MobileModule,
        SharedModule,
    ],
    providers: [
        ECommerceService,
        PageShopService,
        AppService,
        NaoUsersAuthService,
        UserProfileService
    ]
})
export class AppModule {
    constructor(router: Router, viewportScroller: ViewportScroller) {
        router.events.pipe(
            filter((e: Event): e is Scroll => e instanceof Scroll),
        ).subscribe(e => {
            if (e.position) {
                viewportScroller.scrollToPosition(e.position);
            } else if (!e.anchor) {
                viewportScroller.scrollToPosition([0, 0]);
            }
        });
    }
}
