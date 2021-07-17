import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, forkJoin, Subscription } from "rxjs";
import { NaoSettingsInterface } from "@naologic/nao-interfaces";
import { ECommerceService } from "./e-commerce.service";
import { StorageMap } from "@ngx-pwa/local-storage";

@Injectable({
    providedIn: 'root',
})
export class AppService implements OnDestroy {
    public readonly subs = new Subscription();
    /**
     * Global settings for ecommerce
     */
    public readonly settings = new BehaviorSubject<NaoSettingsInterface.Settings>({
        rating: false
    });

    /**
     * All the info you need
     */
    public readonly appInfo = new BehaviorSubject<any>(null);

    constructor(
        private eCommerceService: ECommerceService,
        private readonly storageMap: StorageMap,
    ) {
        this.subs.add(
            // @ts-ignore
            this.appInfo.subscribe((info$: any) => {
                if (info$) {
                    return this.storageMap.set('uygsdf67ts76fguysdfsdf', info$).subscribe(() => {});
                }
            })
        );
        // this.subs.add(
        //     this.appProducts.subscribe(products$ => {
        //         if (products$) {
        //             return this.storageMap.set('sdf7tsef76t7wg4ufwiufs', products$).subscribe(() => {});
        //         }
        //     })
        // );
    }

    // todo: cache the getInfo request

    // todo:

    /**
     * Refresh: info
     */
    public refresh(): void {
        // -->Initial: check
        // todo: do we use StorageMap or something else?
        forkJoin([
            this.storageMap.get('uygsdf67ts76fguysdfsdf'),
            /* todo:Why do we need to 2 storage maps???*/
            this.storageMap.get('sdf7tsef76t7wg4ufwiufs')
        ])
            .subscribe((info$: any) => {
                if (Array.isArray(info$)) {
                    // -->Set: app info
                    this.appInfo.next(info$[0]);
                    // -->Set: products
                    // this.appProducts.next(info$[1]);
                }
                // -->Fresh: the data
                this.eCommerceService.getInfo().subscribe(info$ => {
                    if (info$ && info$.ok) {
                        // -->Set: app info
                        this.appInfo.next(info$.data);
                        // todo: -->Get: featured products
                    } else {
                        // todo-->Error: the request didn't resolve correctly
                    }
                });
            });
    }

    public ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
