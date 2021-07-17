import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NaoUserAccessService } from "@naologic/nao-user-access";
import { Router } from "@angular/router";
import { UserProfileService } from "../../../../services/users-profile.service";

@Component({
    selector: 'app-page-profile',
    templateUrl: './page-profile.component.html',
    styleUrls: ['./page-profile.component.scss'],
})
export class PageProfileComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    private subs = new Subscription();
    public formGroup!: FormGroup;
    public saveInProgress = false;
    public userData;

    constructor(
        private fb: FormBuilder,
        private toastr: ToastrService,
        private router: Router,
        private translate: TranslateService,
        private userProfileService: UserProfileService,
        private naoUsersService: NaoUserAccessService,
    ) { }

    public ngOnInit(): void {
        // -->Get: userData
        this.userData = this.naoUsersService.userData.getValue();
        // -->Check: and redirect
        if (!this.userData) {
            this.router.navigateByUrl('/account/login').then();
            return;
        }
        // -->Subscribe: to userData
        this.subs.add(
            this.naoUsersService.userData.subscribe(userData => {
                // -->Set: user data
                this.userData = userData;
            })
        );
        this.formGroup = this.fb.group({
            firstName: [this.userData.firstName, [Validators.required]],
            lastName: [this.userData.lastName, [Validators.required]],
            phoneNo: [this.userData.phoneNo],
        });
    }

    /**
     * Save data
     */
    public save(): void {
        if (this.saveInProgress || this.formGroup.invalid){
            return;
        }
        // -->Mark
        this.formGroup.markAllAsTouched();
        // -->Start: saving
        this.saveInProgress = true;
        // -->Get: value
        const data = this.formGroup.getRawValue();
        // -->Update
        this.userProfileService.update('profile', data).subscribe(res => {
            if (res && res.ok) {
                // -->Refresh: session data
                this.naoUsersService.refreshSessionData().then(res => {
                    // -->Done: loading
                    this.saveInProgress = false;
                    // -->Show: toaster
                    this.toastr.success(this.translate.instant('TEXT_TOAST_PROFILE_SAVED'));
                }).catch(err => {
                    // -->Done: loading
                    this.saveInProgress = false;
                    // -->Show: toaster
                    this.toastr.error(this.translate.instant('ERROR_API_REQUEST'));
                })
            } else {
                // -->Done: loading
                this.saveInProgress = false;
                // -->Show: toaster
                this.toastr.error(this.translate.instant('ERROR_API_REQUEST'));
            }
        }, error => {
            // -->Done: loading
            this.saveInProgress = false;
            // -->Show: toaster
            this.toastr.error(this.translate.instant('ERROR_API_REQUEST'));
        })
    }


    public ngOnDestroy(): void {
        this.subs.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
