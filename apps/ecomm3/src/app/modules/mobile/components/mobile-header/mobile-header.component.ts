import {
    AfterViewInit,
    Component,
    ElementRef,
    HostBinding,
    Inject,
    NgZone,
    OnDestroy, OnInit,
    PLATFORM_ID,
    ViewChild,
} from '@angular/core';
import { MobileMenuService } from '../../../../services/mobile-menu.service';
import { Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { fromOutsideClick } from '../../../../functions/rxjs/from-outside-click';
import { delay, filter, switchMap, takeUntil } from 'rxjs/operators';
import { CartService } from '../../../../services/cart.service';
import { TranslateService } from '@ngx-translate/core';
import { WishlistService } from '../../../../services/wishlist.service';
import {PageShopService} from "../../../shop/services/page-shop.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-mobile-header',
    templateUrl: './mobile-header.component.html',
    styleUrls: ['./mobile-header.component.scss'],
})
export class MobileHeaderComponent implements OnInit, OnDestroy, AfterViewInit {
    private destroy$: Subject<void> = new Subject<void>();

    searchIsOpen = false;

    searchPlaceholder$!: Observable<string>;

    @HostBinding('class.mobile-header') classMobileHeader = true;

    @ViewChild('searchForm') searchForm!: ElementRef<HTMLElement>;

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLElement>;

    @ViewChild('searchIndicator') searchIndicator!: ElementRef<HTMLElement>;

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private zone: NgZone,
        private translate: TranslateService,
        public menu: MobileMenuService,
        public cart: CartService,
        public wishlist: WishlistService,
        private page: PageShopService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.searchPlaceholder$ = this.translate.stream('INPUT_SEARCH_PLACEHOLDER')
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngAfterViewInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.zone.runOutsideAngular(() => {
            fromOutsideClick([
                this.searchForm.nativeElement,
                this.searchIndicator.nativeElement,
            ]).pipe(
                filter(() => this.searchIsOpen),
                takeUntil(this.destroy$),
            ).subscribe(() => {
                this.zone.run(() => this.closeSearch());
            });
        });
    }

    openSearch(): void {
        this.searchIsOpen = true;

        if (this.searchInput.nativeElement) {
            this.searchInput.nativeElement.focus();
        }
    }

    public searchAndRedirect(searchTerm: string): void {
        // -->Redirect: to shop
        this.router.navigateByUrl('/shop').then();
        // -->Trigger: search
        this.page.setSearchTerm(searchTerm);
    }

    closeSearch(): void {
        this.searchIsOpen = false;
    }
}
