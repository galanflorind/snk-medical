import {
    AfterViewInit,
    Component,
    ElementRef, HostBinding,
    Inject,
    NgZone,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { Product } from '../../../../interfaces/product';
import { ShopCategory } from '../../../../interfaces/category';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { PageShopService } from "../../../shop/services/page-shop.service";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import {Router} from "@angular/router";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
    private destroy$: Subject<void> = new Subject<void>();

    public query$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    /**
     * TODO: when we have suggestions, uncomment everything from both html and ts fiel
     */
    public suggestionsIsOpen = false;

    public hasSuggestions = false;

    // public products: Product[] = [];

    // public categories: ShopCategory[] = [];

    @HostBinding('class.search') public classSearch = true;

    // get element(): HTMLElement { return this.elementRef.nativeElement; }

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private zone: NgZone,
        private translate: TranslateService,
        private elementRef: ElementRef,
        private page: PageShopService,
        private router: Router
    ) { }

    public ngOnInit(): void {
        // this.query$.pipe(
        //     distinctUntilChanged(),
        //     switchMap(query => this.shopApi.getSearchSuggestions(query, {
        //         limitProducts: 3,
        //         limitCategories: 4,
        //     })),
        //     takeUntil(this.destroy$),
        // ).subscribe(result => {
        //     if (result.products.length === 0 && result.categories.length === 0) {
        //         this.hasSuggestions = false;
        //         return;
        //     }
        //
        //     this.hasSuggestions = true;
        //     this.products = result.products;
        //     this.categories = result.categories;
        // });

        // -->Subscribe: to search
        this.query$.pipe(distinctUntilChanged(), debounceTime(600)).subscribe(searchTerm => {
            // -->Trigger: search
            this.page.setSearchTerm(searchTerm);
        })
    }



    ngAfterViewInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        // this.zone.runOutsideAngular(() => {
        //     // fromOutsideClick([
        //     //     this.selectVehicleButton.nativeElement,
        //     //     this.vehiclePickerDropdown.nativeElement,
        //     // ]).pipe(
        //     //     filter(() => this.vehiclePickerIsOpen),
        //     //     takeUntil(this.destroy$),
        //     // ).subscribe(() => {
        //     //     this.zone.run(() => this.vehiclePickerIsOpen = false);
        //     // });
        //
        //     fromOutsideClick(this.element).pipe(
        //         filter(() => this.suggestionsIsOpen),
        //         takeUntil(this.destroy$),
        //     ).subscribe(() => {
        //         this.zone.run(() => this.toggleSuggestions(false));
        //     });
        //
        //     fromEvent(this.element, 'focusout').pipe(
        //         debounceTime(10),
        //         takeUntil(this.destroy$),
        //     ).subscribe(() => {
        //         if (document.activeElement === document.body) {
        //             return;
        //         }
        //
        //         // Close suggestions if the focus received an external element.
        //         if (document.activeElement && document.activeElement.closest('.search') !== this.element) {
        //             this.zone.run(() => this.toggleSuggestions(false));
        //         }
        //     });
        // });
    }

    public onSearchKeyUp(event: Event): void {
        const input = event.target as HTMLInputElement;

        this.query$.next(input.value);
    }

    public searchAndRedirect(): void {
        // -->Redirect: to shop
        this.router.navigateByUrl('/shop').then();
        // -->Trigger: search
        this.page.setSearchTerm(this.query$.getValue());

    }

    // toggleSuggestions(force?: boolean): void {
    //     this.suggestionsIsOpen = force !== undefined ? force : !this.suggestionsIsOpen;
    // }


    // /**
    //  * On input focus
    //  */
    // public onInputFocus(event: FocusEvent): void {
    //     const input = event.target as HTMLInputElement;
    //
    //     // this.toggleSuggestions(true);
    //     this.search(input.value);
    // }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
