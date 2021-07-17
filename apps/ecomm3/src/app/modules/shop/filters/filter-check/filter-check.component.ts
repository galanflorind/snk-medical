import { Component, forwardRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseFilterItem, CheckFilter } from '../../../../interfaces/filter';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-filter-check',
    templateUrl: './filter-check.component.html',
    styleUrls: ['./filter-check.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FilterCheckComponent),
            multi: true,
        },
    ],
})
export class FilterCheckComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @HostBinding('class.filter-list') public classFilterList = true;
    @Input() public options!: CheckFilter;
    private destroy$: Subject<void> = new Subject<void>();
    public value: any[] = [];
    public control: FormControl = new FormControl([]);

    public changeFn: (_: number) => void = () => {};

    public touchedFn: () => void = () => {};

    constructor() { }

    public ngOnInit(): void {
        this.control.valueChanges.pipe(
            filter(value => value !== this.value),
            takeUntil(this.destroy$),
        ).subscribe(value => this.changeFn(value));
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public registerOnChange(fn: any): void {
        this.changeFn = fn;
    }

    public registerOnTouched(fn: any): void {
        this.touchedFn = fn;
    }

    public writeValue(obj: any): void {
        this.control.setValue(this.value = obj, { emitEvent: false });
    }

    public trackBy(index: number, item: BaseFilterItem): string {
        return item._id;
    }
}
