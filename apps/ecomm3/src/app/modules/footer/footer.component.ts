import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from "rxjs";
import { AppService } from "../../app.service";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
    private subs = new Subscription();
    public infoSupport = null;

    constructor(public appService: AppService) { }

    public ngOnInit(): void {
        this.subs.add(
            this.appService.appInfo.subscribe(value => {
                // -->Set: info
                this.infoSupport = value?.support?.supportInfo;
            })
        )
    }

    public ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
