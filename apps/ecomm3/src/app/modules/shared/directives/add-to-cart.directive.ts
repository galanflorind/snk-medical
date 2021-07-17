import { ChangeDetectorRef, Directive, OnDestroy } from '@angular/core';
import {Product, Variant} from '../../../interfaces/product';
import { CartService } from '../../../services/cart.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[appAddToCart]',
    exportAs: 'addToCart',
})
export class AddToCartDirective implements OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    public inProgress = false;

    constructor(
        private cart: CartService,
        private cd: ChangeDetectorRef,
    ) { }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public add(product: Product, variant: Variant, quantity: number = 1): void {
        if (this.inProgress) {
            return;
        }

        this.inProgress = true;
        this.cart.add(product, variant, quantity).pipe(takeUntil(this.destroy$)).subscribe({
            complete: () => {
                this.inProgress = false;
                this.cd.markForCheck();
            },
        });
    }
}
