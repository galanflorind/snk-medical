import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ShopSidebarService } from '../../services/shop-sidebar.service';
import { PageShopService } from '../../services/page-shop.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ShopApi } from '../../../../api';
import { merge, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { UrlService } from '../../../../services/url.service';
import { ShopCategory } from '../../../../interfaces/category';
import { LanguageService } from '../../../language/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ProductsList } from '../../../../interfaces/list';
import { filterHandlers } from '../../filters/filter-handlers';
import { BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { Filter } from '../../../../interfaces/filter';
import { FilterHandler } from '../../filters/filter.handler';
import { ECommerceService } from "../../../../e-commerce.service";
import { AppService } from "../../../../app.service";
import {
    buildCategoriesFilter,
    buildManufacturerFilter,
    buildPriceFilter
} from "../../filters/filter.utils.static";
import { getBreadcrumbs } from "../../../../../fake-server/utils";


export type PageShopLayout =
    'grid' |
    'grid-with-features' |
    'list' |
    'table';

export type PageShopGridLayout =
    'grid-3-sidebar' |
    'grid-4-sidebar' |
    'grid-4-full' |
    'grid-5-full' |
    'grid-6-full';

export type PageShopSidebarPosition = 'start' | 'end' | false;

export type PageShopOffCanvasSidebar = 'always' | 'mobile';

export interface PageShopData {
    layout: PageShopLayout;
    gridLayout: PageShopGridLayout;
    sidebarPosition: PageShopSidebarPosition;
    category: ShopCategory;
    productsList: ProductsList;
}

@Component({
    selector: 'app-page-shop',
    templateUrl: './page-shop.component.html',
    styleUrls: ['./page-shop.component.scss'],
    providers: [
        ShopSidebarService,
    ],
})
export class PageShopComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();

    public layout: PageShopLayout = 'grid';

    public gridLayout: PageShopGridLayout = 'grid-4-sidebar';

    public sidebarPosition: PageShopSidebarPosition = 'start';

    public pageTitle$!: string;

    public breadcrumbs: BreadcrumbItem[];
    private refreshSubs = new Subscription();

    get offCanvasSidebar(): PageShopOffCanvasSidebar {
        return ['grid-4-full', 'grid-5-full', 'grid-6-full'].includes(this.gridLayout) ? 'always' : 'mobile';
    }

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private page: PageShopService,
        private shop: ShopApi,
        private location: Location,
        private url: UrlService,
        private language: LanguageService,
        private translate: TranslateService,
        private eCommerceService: ECommerceService,
        private appService: AppService,
    ) { }

    public ngOnInit(): void {
        const data$: Observable<PageShopData> = this.route.data as Observable<PageShopData>;
        // -->Set: title
        this.pageTitle$ = this.translate.instant('HEADER_SHOP');
        // -->Set: breadcrumb
        this.breadcrumbs = [
            { label: this.translate.instant('LINK_HOME'), url: this.url.home() },
            { label: this.translate.instant('LINK_SHOP'), url: this.url.shop() },
        ]

        data$.subscribe((data: PageShopData) => {
            this.layout = data.layout;
            this.gridLayout = data.gridLayout;
            this.sidebarPosition = data.sidebarPosition;
        });

        data$.pipe(
            switchMap((data: PageShopData) => merge(
                of(data.productsList),
                this.router.events,
                this.page.optionsChange$.pipe(
                    map(() => {
                        // todo: fix the update url
                        this.updateUrl();
                        return null
                    }),
                ),
            )),
            debounceTime(100),
            takeUntil(this.destroy$),
        ).subscribe(options => {
            this.refresh();
        });
    }


    /**
     * Refresh products
     */
    public refresh(): void {
        if (this.refreshSubs) {
            this.refreshSubs.unsubscribe();
            this.refreshSubs = null;
        }

        // -->Start: loading
        this.page.isLoading = true
        // -->Get: category id
        const categoryId: number = this.route.snapshot.params.categoryId ? +this.route.snapshot.params.categoryId : undefined;
        // -->Create: filters options
        const options =  {
            ...this.page.options,
            filters: {
                ...this.page.options.filters,
                category: categoryId,
            },
        } as any;

        // -->Get: Selected manufacturers
        const selectedManufacturerIds = options?.filters?.manufacturer?.split(',')?.filter(f => f) || [];


        // -->Create: query
        const query = {
            searchTerm: options.searchTerm, // search name, description, itemId, manufacturerId, partId
            categoryId: options.filters?.category,
            manufacturerIds: selectedManufacturerIds,
            sortBy: 'name',
            sortOrder: options.sort === 'name_asc' ? 1 : -1, // 1 = asc/ -1 = desc
            pageSize: options.limit || this.page.defaultOptions.limit,
            pageNo: options.page || this.page.defaultOptions.page,
            calculateFilters: true
        } as any;

        // -->Get: min and max price range
        let minPrice, maxPrice;
        // -->Check: if there is a price already set, if not wait for the response
        if (options?.filters?.price?.split('-')?.length) {
            // -->Split: string to get min and max price
            [minPrice, maxPrice] = options?.filters?.price?.split('-').map(p => +p);
            // -->Set: only if both of them are numbers
            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                query.minPrice = minPrice
                query.maxPrice = maxPrice
            }
        }

        // -->Execute
        this.refreshSubs = this.eCommerceService.productsFilter(query).subscribe((res) => {
            // -->Check: res
            if (res && res.ok && res.data) {

                // -->Init: filters
                const filters = [];
                // -->Push: category filters
                filters.push(buildCategoriesFilter(this.appService.appInfo?.getValue()?.categories?.items || [], categoryId))
                // --->Push: price filter
                filters.push(buildPriceFilter(res.data?.filterInfo?.min, res.data?.filterInfo?.max, minPrice, maxPrice));
                // -->Push: manufacturers filter
                filters.push(buildManufacturerFilter(res.data?.filterInfo?.vendors || [], selectedManufacturerIds))

                // -->Set: List and calculate pages and everything
                const list =  {
                    items: res.data.items || [],
                    filters: filters,
                    page: options.page || 1,
                    limit: query.pageSize,
                    sort: options.sort || this.page.defaultOptions.sort,
                    total: res.data?.count || 0,
                    pages: Math.ceil(res.data?.count / query.pageSize),
                    from: (options.page - 1) * query.pageSize + 1,
                    to: (options.page * query.pageSize) < res.data?.count ? (options.page * query.pageSize) : res.data?.count
                };

                // -->Get: breadcrumbs
                const breadcrumbs = getBreadcrumbs(this.appService.appInfo?.getValue()?.categories?.items, categoryId)
                // -->Update: breadcrumbs
                this.breadcrumbs = [
                    { label: this.translate.instant('LINK_HOME'), url: this.url.home() },
                    { label: this.translate.instant('LINK_SHOP'), url: this.url.shop() },
                    ...breadcrumbs.map(x => ({ label: x.name, url: this.url.category(x) })),
                ]
                if (breadcrumbs.length) {
                    this.pageTitle$ = breadcrumbs[breadcrumbs.length - 1].name;
                } else {
                    // -->Set: title
                    this.pageTitle$ = this.translate.instant('HEADER_SHOP');
                }

                // -->Set: data
                this.page.isLoading = false;
                this.page.setList(list);



                // this.updateUrl();

            } else {
                this.page.isLoading = false;
                // todo: show errors
                // todo: refresh with default data
            }
        });
    }


    /**
     * Update url
     */
    private updateUrl(): void {
        const tree = this.router.parseUrl(this.router.url);
        tree.queryParams = this.getQueryParams();
        this.location.replaceState(tree.toString());
    }

    /**
     * Get query params
     */
    private getQueryParams(): Params {
        // todo: this should be done on first request data and to params????
        // todo: this should be done on first request data and to params????
        // todo: this should be done on first request data and to params????
        // todo: this should be done on first request data and to params????
        const params: Params = {};
        const options = this.page.options;
        const filterValues = options.filters || {};

        if ('page' in options && options.page !== this.page.defaultOptions.page) {
            params.page = options.page ? options.page : this.page.defaultOptions.page;
        }
        if ('limit' in options && options.limit !== this.page.defaultOptions.limit) {
            params.limit = options.limit ? options.limit : this.page.defaultOptions.limit;
        }
        if ('sort' in options && options.sort !== this.page.defaultOptions.sort) {
            params.sort = options.sort ? options.sort : this.page.defaultOptions.sort;
        }
        if ('filters' in options) {
            this.page.filters
                .map(
                    filter => ({
                        filter,
                        handler: filterHandlers.find(x => x.type === filter.type),
                    }),
                )
                .filter(
                    (x): x is {filter: Filter; handler: FilterHandler} => (
                        !!x.handler && !!filterValues[x.filter.slug]),
                    )
                .forEach(({ filter, handler }) => {
                    const value = handler.deserialize(filterValues[filter.slug]);

                    if (!handler.isDefaultValue(filter, value)) {
                        params[`filter_${filter.slug}`] = handler.serialize(value);
                    }
                });
        }

        return params;
    }


    /**
     * Destroy
     */
    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
