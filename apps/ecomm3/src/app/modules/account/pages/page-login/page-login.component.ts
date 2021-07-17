import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NaoUserAccessService } from "@naologic/nao-user-access";

@Component({
    selector: 'app-page-login',
    templateUrl: './page-login.component.html',
    styleUrls: ['./page-login.component.scss'],
})
export class PageLoginComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    public formGroup!: FormGroup;
    public loginInProgress = false;


    constructor(
        private fb: FormBuilder,
        private router: Router,
        private naoUsersService: NaoUserAccessService,
    ) { }

    public ngOnInit(): void {
        this.formGroup = this.fb.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(8)]],
            rememberMe: [false],
        });
    }

    public login(): void {
        this.formGroup.markAllAsTouched();

        if (this.loginInProgress || this.formGroup.invalid) {
            return;
        }
        // -->Get: formGroup data
        const fd = this.formGroup.getRawValue();

        this.loginInProgress = true;
        // -->Execute: a login
        this.naoUsersService
            .loginWithEmail(fd.email, fd.password, fd.rememberMe)
            .then((res) => {
                this.loginInProgress = false;
                // -->Redirect
                return this.router.navigate(['/', 'account', 'dashboard']);
            })
            .catch((err) => {
                // -->Reset:
                this.formGroup.get('password').reset();
                this.formGroup.get('password').markAllAsTouched();
                this.formGroup.get('password').updateValueAndValidity();
                this.loginInProgress = false;
            });
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
