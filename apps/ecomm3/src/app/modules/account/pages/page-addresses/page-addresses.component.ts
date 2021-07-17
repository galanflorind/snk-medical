import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { UrlService } from '../../../../services/url.service';
import { NaoUserAccessService, NaoUsersInterface } from "@naologic/nao-user-access";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { UserProfileService } from "../../../../services/users-profile.service";

@Component({
    selector: 'app-page-addresses',
    templateUrl: './page-addresses.component.html',
    styleUrls: ['./page-addresses.component.scss'],
})
export class PageAddressesComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    public addresses: NaoUsersInterface.Address[] = [];
    public removeInProgress: string[] = [];
    public subs = new Subscription();

    constructor(
        private naoUsersService: NaoUserAccessService,
        public url: UrlService,
        private toastr: ToastrService,
        private translate: TranslateService,
        private userProfileService: UserProfileService,
    ) { }

    public ngOnInit(): void {
        // -->Subscribe: to linkedDoc
        this.subs.add(
            this.naoUsersService.linkedDoc.subscribe(linkedDoc => {
                // -->Check: if there is an address
                if (Array.isArray(linkedDoc?.data?.addresses) && linkedDoc.data.addresses.length) {
                    // -->Set: first address as default for now
                    this.addresses = linkedDoc.data.addresses;
                }
            })
        )
    }

    public ngOnDestroy(): void {
        this.subs.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    public remove(address: NaoUsersInterface.Address): void {
        if (!address || this.removeInProgress.indexOf(address.id) !== -1 || !address.id) {
            return;
        }
        // -->Start: progress
        this.removeInProgress.push(address.id);
        // -->Set: data
        const data = {
            addresses: this.addresses.filter(item => item.id !== address.id)
        }
        // -->Update
        this.userProfileService.update('addresses', data).subscribe(res => {
            if (res && res.ok) {
                // -->Refresh: session data
                this.naoUsersService.refreshSessionData().then(res => {
                    // -->Done: loading
                    const index = this.removeInProgress.indexOf(address.id);
                    // -->Filter: addresses
                    this.addresses = this.addresses.filter(item => item.id !== address.id);

                    if (index !== -1) {
                        this.removeInProgress.splice(index, 1);
                    }
                    // -->Show: toaster
                    this.toastr.success(
                        this.translate.instant('TOASTER_ADDRESS_DELETED'),
                    );
                    // -->Show: toaster
                }).catch(err => {
                    // -->Show: toaster
                    this.toastr.error(this.translate.instant('ERROR_API_REQUEST'));
                })
            } else {
                // -->Show: toaster
                this.toastr.error(this.translate.instant('ERROR_API_REQUEST'));
            }
        }, error => {
            // -->Show: toaster
            this.toastr.error(this.translate.instant('ERROR_API_REQUEST'));
        })
    }
}
