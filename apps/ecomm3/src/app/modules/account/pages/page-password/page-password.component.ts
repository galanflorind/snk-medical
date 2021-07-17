import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { mustMatchValidator } from '../../../../functions/validators/must-match';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Router } from "@angular/router";
import { UserProfileService } from "../../../../services/users-profile.service";

@Component({
    selector: 'app-page-password',
    templateUrl: './page-password.component.html',
    styleUrls: ['./page-password.component.scss'],
})
export class PagePasswordComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    public form!: FormGroup;
    public saveInProgress = false;

    constructor(
        private toastr: ToastrService,
        private translate: TranslateService,
        private fb: FormBuilder,
        private router: Router,
        private userProfileService: UserProfileService,
    ) { }

    public ngOnInit(): void {
        this.form = this.fb.group({
            currentPassword: ['', [Validators.required, Validators.minLength(8)]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
        }, { validators: [mustMatchValidator('password', 'confirmPassword')] });
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public save(): void {
        this.form.markAllAsTouched();

        if (this.saveInProgress || this.form.invalid) {
            return;
        }

        // -->Start: loading
        this.saveInProgress = true;

        // -->Update
        this.userProfileService.updatePassword(this.form.value).subscribe(res => {
            if (res && res.ok) {
                return this.router.navigate(['/', 'account', 'dashboard']);
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
}
