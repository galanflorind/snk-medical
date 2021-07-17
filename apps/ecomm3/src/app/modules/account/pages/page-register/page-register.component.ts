import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { mustMatchValidator } from '../../../../functions/validators/must-match';
import { NaoUserAccessService } from "@naologic/nao-user-access";
import { NaoUsersAuthService } from "../../../../services/nao-users-auth.service";

@Component({
    selector: 'app-page-register',
    templateUrl: './page-register.component.html',
    styleUrls: ['./page-register.component.scss'],
})
export class PageRegisterComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    public formGroup!: FormGroup;
    public registerInProgress = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private naoUsersService: NaoUserAccessService,
        private naoUsersAuthService: NaoUsersAuthService,
    ) { }

    public ngOnInit(): void {
        this.formGroup = this.fb.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(8)]],
            firstName: [null, [Validators.required]],
            lastName: [null, [Validators.required]],
            companyName: [null, [Validators.required]],
            confirmPassword: [null, [Validators.required, Validators.minLength(8)]],
        }, { validators: [mustMatchValidator('password', 'confirmPassword')] });
    }


    public register(): void {
        this.formGroup.markAllAsTouched();
        // -->Check
        if (this.registerInProgress || this.formGroup.invalid) {
            return;
        }

        // -->Get: data
        const data = this.formGroup.getRawValue();
        // -->Start: loading
        this.registerInProgress = true;
        // -->Update: doc
        this.naoUsersAuthService.createUser(data).subscribe(
            (ok) => {
                // -->Execute: a login
                this.naoUsersService
                    .loginWithEmail(data.email, data.password, data.rememberMe)
                    .then((ok2) => {
                        this.registerInProgress = false
                        // -->Redirect
                        return this.router.navigate(['/', 'account', 'dashboard']);
                    })
                    .catch((err) => {
                        this.registerInProgress = false
                        this.formGroup.reset();
                    });
            },
            (err) => {
                this.registerInProgress = false
                this.formGroup.enable();
            }
        );
    }


    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
