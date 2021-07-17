import { Component, OnDestroy, OnInit } from '@angular/core';
import { UrlService } from '../../../../services/url.service';
import { AppService } from "../../../../app.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-page-faq',
    templateUrl: './page-faq.component.html',
    styleUrls: ['./page-faq.component.scss'],
})
export class PageFaqComponent implements OnInit, OnDestroy {
    private subs = new Subscription();
    public faq = [];
    public infoSupport

    constructor(
        public url: UrlService,
        public appService: AppService,
    ) { }

    public ngOnInit(): void {
        // -->Subscribe: to appInfo changes
        this.subs.add(
            this.appService.appInfo.subscribe(value => {
                // -->Set: info
                this.faq = value?.support?.faqContent?.faqItems || [];
                // -->Set: info
                this.infoSupport = value?.support?.supportInfo;
            })
        );
    }

    public ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
