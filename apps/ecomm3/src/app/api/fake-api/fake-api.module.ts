import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FakeShopApi } from './fake-shop.api';
import {ShopApi} from "../base";

@NgModule({
    imports: [
        CommonModule,
    ],
    providers: [
        { provide: ShopApi, useClass: FakeShopApi },
    ],
})
export class FakeApiModule { }
