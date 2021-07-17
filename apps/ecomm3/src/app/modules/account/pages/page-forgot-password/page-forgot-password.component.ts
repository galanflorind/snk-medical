import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NaoUserAccessService } from "@naologic/nao-user-access";
import { UserProfileService } from "../../../../services/users-profile.service";

@Component({
    selector: 'app-page-forgot-password',
    templateUrl: './page-forgot-password.component.html',
    styleUrls: ['./page-forgot-password.component.scss'],
})
export class PageForgotPasswordComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    public formGroup!: FormGroup;
    public resetInProgress = false;


    constructor(
        private fb: FormBuilder,
        private router: Router,
        private naoUsersService: NaoUserAccessService,
        private userProfileService: UserProfileService,
    ) { }

    public ngOnInit(): void {
        this.formGroup = this.fb.group({
            email: [null, [Validators.required, Validators.email]],
        });
    }

    public resetPassword(): void {
        this.formGroup.markAllAsTouched();

        if (this.resetInProgress || this.formGroup.invalid) {
            return;
        }
        // -->Get: formGroup data
        const fd = this.formGroup.getRawValue();

        this.resetInProgress = true;
        // -->Execute: a login
        this.userProfileService
            .sendResetPasswordEmail(fd.email)
            .subscribe((res) => {
                this.resetInProgress = false;
                // -->Redirect
                // return this.router.navigate(['/', 'account', 'dashboard']);
            },(err) => {
                this.resetInProgress = false;
                // todo: show toaster with error
                // todo: show toaster with error
                // todo: show toaster with error
                this.formGroup.reset();
            });
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
