import {
    Component,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
} from '@angular/core';
import { DepartmentsLink } from '../../../../interfaces/departments-link';
import { fromOutsideClick } from '../../../../functions/rxjs/from-outside-click';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-departments',
    templateUrl: './departments.component.html',
    styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit, OnDestroy {
    @Input() public items: DepartmentsLink[] = [];
    @Input() public label: string = '';

    @HostBinding('class.departments') public classDepartments = true;

    @HostBinding('class.departments--open') get classDepartmentsOpen() {
        return this.isOpen;
    }

    private destroy$: Subject<void> = new Subject<void>();
    public isOpen = false;
    public currentItem: DepartmentsLink|null = null;



    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private elementRef: ElementRef<HTMLElement>,
        private zone: NgZone,
    ) { }

    public ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.zone.runOutsideAngular(() => {
            fromOutsideClick(this.elementRef.nativeElement).pipe(
                filter(() => this.isOpen),
                takeUntil(this.destroy$),
            ).subscribe(() => {
                this.zone.run(() => this.isOpen = false);
            });
        });
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public onClick() {
        this.isOpen = !this.isOpen;
    }

    public onMouseenter(item: DepartmentsLink) {
        this.currentItem = item;
    }

    public onMouseleave() {
        this.currentItem = null;
    }

    public onItemClick(): void {
        this.isOpen = false;
        this.currentItem = null;
    }
}
