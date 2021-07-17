import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { Product } from '../../../../interfaces/product';
import { QuickviewService } from '../../../../services/quickview.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { UrlService } from '../../../../services/url.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CartService } from '../../../../services/cart.service';
import { NavigationStart, Router } from '@angular/router';
import { AppService } from "../../../../app.service";
import { NaoSettingsInterface } from "@naologic/nao-interfaces";

@Component({
    selector: 'app-quickview',
    templateUrl: './quick-view.component.html',
    styleUrls: ['./quick-view.component.scss'],
})
export class QuickViewComponent implements OnDestroy, AfterViewInit, OnInit {
    private destroy$: Subject<void> = new Subject();
    public appSettings: NaoSettingsInterface.Settings;
    public showGallery = false;
    public product: Product | null = null;
    public form!: FormGroup;
    public addToCartInProgress = false;
    public variantIndex = 0;
    private subs = new Subscription();

    @ViewChild('modal') modal!: ModalDirective;

    constructor(
        private fb: FormBuilder,
        private quickview: QuickviewService,
        private translate: TranslateService,
        private cart: CartService,
        private router: Router,
        public url: UrlService,
        private appService: AppService,
    ) {
    }

    public ngOnInit(): void {
        // -->Set: app settings
        this.appSettings = this.appService.settings.getValue();
    }

    public ngAfterViewInit(): void {
        this.quickview.show$.pipe(
            switchMap(product => {
                this.modal.show();
                this.product = product;

                this.form = this.fb.group({
                    options: [{}],
                    quantity: [1, [Validators.required]],
                });

                // -->Subscribe: to options change and change the variant id
                this.subs.add(
                    this.form.get('options').valueChanges.subscribe(value => {
                        // -->Match: search for variant index
                        const index = this.product.data.variants.findIndex(v => v.id === value?.variantId);
                        // -->Set: variant index
                        if (index > -1) {
                            this.variantIndex = index;
                        }
                    })
                )

                // We are waiting for when the content will be rendered.
                // 150 = BACKDROP_TRANSITION_DURATION
                return timer(150);
            }),
            takeUntil(this.destroy$),
        ).subscribe(() => {
            // Show gallery only after content is rendered.
            this.showGallery = this.product !== null;
        });

        this.router.events.pipe(
            filter(event => event instanceof NavigationStart),
            takeUntil(this.destroy$),
        ).subscribe(() => {
            if (this.modal && this.modal.isShown) {
                this.modal.hide();
            }
        });

        this.modal.onHidden.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.product = null;
            this.showGallery = false;
        });
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    public addToCart(): void {
        const product = this.product;

        if (!product) {
            return;
        }
        if (this.addToCartInProgress) {
            return;
        }
        if (this.form.get('quantity')!.invalid) {
            alert(this.translate.instant('ERROR_ADD_TO_CART_QUANTITY'));
            return;
        }
        if (this.form.get('options')!.invalid) {
            alert(this.translate.instant('ERROR_ADD_TO_CART_OPTIONS'));
            return;
        }

        const variant = this.product?.data?.variants[this.variantIndex];
        if (!variant) {
            return;
        }

        this.addToCartInProgress = true;

        this.cart.add(product, variant, this.form.get('quantity')!.value).pipe(
            finalize(() => this.addToCartInProgress = false),
        ).subscribe();
    }
}
