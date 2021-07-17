import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input, OnChanges,
    OnDestroy,
    OnInit, SimpleChanges,
} from '@angular/core';
import { CurrencyService } from '../../../currency/services/currency.service';
import { Subject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';
import { QuickviewService } from '../../../../services/quickview.service';
import { UrlService } from '../../../../services/url.service';
import { Product, ProductAttribute, ProductCompatibilityResult } from '../../../../interfaces/product';
import {AppService} from "../../../../app.service";
import {NaoSettingsInterface} from "@naologic/nao-interfaces";

export type ProductCardElement = 'actions' | 'status-badge' | 'meta' | 'features' | 'buttons' | 'list-buttons';

export type ProductCardLayout = 'grid' | 'list' | 'table' | 'horizontal';

@Component({
    selector: 'app-product-card',
    templateUrl: './product-card.component.html',
    styleUrls: ['./product-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent implements OnChanges, OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject();
    public appSettings: NaoSettingsInterface.Settings;

    showingQuickview = false;

    featuredAttributes: ProductAttribute[] = [];

    // TODO: update the interface
    @Input() product!: Product | any;

    @Input() layout?: ProductCardLayout;

    @Input() exclude: ProductCardElement[] = [];

    @HostBinding('class.product-card') classProductCard = true;

    @HostBinding('class.product-card--layout--grid') get classProductCardLayoutGrid(): boolean {
        return this.layout === 'grid';
    }

    @HostBinding('class.product-card--layout--list') get classProductCardLayoutList(): boolean {
        return this.layout === 'list';
    }

    @HostBinding('class.product-card--layout--table') get classProductCardLayoutTable(): boolean {
        return this.layout === 'table';
    }

    @HostBinding('class.product-card--layout--horizontal') get classProductCardLayoutHorizontal(): boolean {
        return this.layout === 'horizontal';
    }

    constructor(
        private cd: ChangeDetectorRef,
        private quickViewService: QuickviewService,
        public currency: CurrencyService,
        public url: UrlService,
        private appService: AppService,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.product) {
            // this.featuredAttributes = this.product.attributes.filter(x => x.featured);

            // -->Calculate: min and max price for this product
            const minPrice = this.product?.data?.variants?.reduce((min, variant) => (variant.price < min ? variant.price : min), this.product.data.variants[0].price)
            const maxPrice = this.product?.data?.variants?.reduce((max, variant) => (variant.price > max ? variant.price : max), this.product.data.variants[0].price)
            // -->Set: min and max price
            this.product.minPrice = minPrice;
            this.product.maxPrice = maxPrice;
        }
    }

    ngOnInit(): void {
        // -->Set: app settings
        this.appSettings = this.appService.settings.getValue();

        this.currency.changes$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.cd.markForCheck();
        });

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Show: quick view
     */
    public showQuickView(): void {
        if (this.showingQuickview) {
            return;
        }

        this.showingQuickview = true;
        this.quickViewService.show(this.product).subscribe({
            complete: () => {
                this.showingQuickview = false;
                this.cd.markForCheck();
            },
        });
    }

    compatibility(): ProductCompatibilityResult {
        if (this.product.compatibility === 'all') {
            return 'all';
        }
        if (this.product.compatibility === 'unknown') {
            return 'unknown';
        }
        // todo:
        // if (this.vehicle && this.product.compatibility.includes(this.vehicle.id)) {
        //     return 'fit';
        // } else {
            return 'not-fit';
        // }
    }

}
