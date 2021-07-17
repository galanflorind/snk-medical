import { Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validator,
    Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { ActiveCountryList } from "../../../../app.locale";
import { generateRandomString } from "@naologic/nao-utils";
import { NaoUsersInterface } from "@naologic/nao-user-access";

@Component({
    selector: 'app-address-form',
    templateUrl: './address-form.component.html',
    styleUrls: ['./address-form.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AddressFormComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => AddressFormComponent),
            multi: true,
        },
    ],
})
export class AddressFormComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
    private destroy$: Subject<void> = new Subject<void>();
    public formGroup: FormGroup = new FormGroup({
        city: new FormControl("", { validators: [Validators.required] }),
        country: new FormControl('USA', { validators: [Validators.required] }),
        id: new FormControl(generateRandomString(12)),
        line_1: new FormControl("", { validators: [Validators.required] }),
        line_2: new FormControl(""),
        state: new FormControl("", { validators: [Validators.required] }),
        type: new FormControl('shipping', { validators: [Validators.required] }),
        zip: new FormControl(null, { validators: [Validators.required] }),
    });

    // -->Set: countries
    public countries = ActiveCountryList;


    changeFn: (_: NaoUsersInterface.Address) => void = () => {};

    touchedFn: () => void = () => {};

    constructor(
    ) { }

    ngOnInit(): void {
        this.formGroup.valueChanges.subscribe(value => {
            this.changeFn(value);
            this.touchedFn();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    registerOnChange(fn: any): void {
        this.changeFn = fn;
    }

    registerOnTouched(fn: any): void {
        this.touchedFn = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.formGroup.disable({ emitEvent: false });
        } else {
            this.formGroup.enable({ emitEvent: false });
        }
    }

    writeValue(value: any): void {
        if (typeof value !== 'object') {
            value = {};
        }

        this.formGroup.setValue(
            {
                city: '',
                country: 'USA',
                id: '',
                line_1: '',
                line_2: '',
                state: '',
                type: 'shipping',
                zip: '',
                ...value,
            },
            { emitEvent: false },
        );
    }

    validate(control: AbstractControl): ValidationErrors | null {
        return this.formGroup.valid ? null : { addressForm: this.formGroup.errors };
    }

    markAsTouched(): void {
        this.formGroup.markAllAsTouched();
    }
}
