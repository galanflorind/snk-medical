import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    HostBinding,
    Inject,
    NgZone,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { MobileMenuService } from '../../../../services/mobile-menu.service';
import { MobileMenuPanelComponent } from '../mobile-menu-panel/mobile-menu-panel.component';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { MobileMenuLink } from '../../../../interfaces/mobile-menu-link';
import { nameToSlug } from "../../../../../fake-server/utils";
import { AppService } from "../../../../app.service";

interface StackItem {
    content: TemplateRef<any>;
    componentRef: ComponentRef<MobileMenuPanelComponent>;
}

@Component({
    selector: 'app-mobile-menu',
    templateUrl: './mobile-menu.component.html',
    styleUrls: ['./mobile-menu.component.scss'],
})
export class MobileMenuComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
    @HostBinding('class.mobile-menu') classMobileMenu = true;

    @HostBinding('class.mobile-menu--open') get classMobileMenuOpen() {
        return this.menu.isOpen;
    }

    @ViewChild('body') body!: ElementRef;

    @ViewChild('conveyor') conveyor!: ElementRef;

    @ViewChild('panelsContainer', { read: ViewContainerRef }) panelsContainer!: ViewContainerRef;


    private destroy$: Subject<void> = new Subject<void>();
    public links = [];
    public currentLevel = 0;
    public panelsStack: StackItem[] = [];
    public panelsBin: StackItem[] = [];
    public forceConveyorTransition = false;
    private subs = new Subscription();
    public infoSupport = null;

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private cfr: ComponentFactoryResolver,
        private zone: NgZone,
        public menu: MobileMenuService,
        public appService: AppService,
    ) { }

    public ngOnInit(): void {
        // -->Subscribe: to info changes
        this.subs.add(
            this.appService.appInfo.subscribe(value => {
                // -->Set: info
                this.infoSupport = value?.support?.supportInfo;
                // -->Set: categories
                const categories = this.mapCategories(value?.categories?.items)

                // -->Add: other links here!!!!
                this.links = [
                    {
                        title: 'Shop',
                        url: '/shop/category/products',
                    },
                    {
                        title: 'Categories',
                        url: '/shop/category/products',
                        submenu: categories
                    },
                    {
                        title: 'About Us',
                        url: '/site/about-us',
                    },
                    {
                        title: 'FAQ',
                        url: '/site/faq',
                    },
                    // {
                    //     title: 'About Us',
                    //     url: '/site/about-us',
                    //     submenu: [
                    //         { title: 'About Us', url: '/site/about-us' },
                    //         { title: 'Contact Us v1', url: '/site/contact-us-v1' },
                    //         { title: 'Contact Us v2', url: '/site/contact-us-v2' },
                    //         { title: '404', url: '/site/not-found' },
                    //         { title: 'Terms And Conditions', url: '/site/terms' },
                    //         { title: 'FAQ', url: '/site/faq' },
                    //         { title: 'Components', url: '/site/components' },
                    //         { title: 'Typography', url: '/site/typography' },
                    //     ],
                    // }
                ]

            })
        )
        // -->Set: menu


        this.menu.onOpenPanel.pipe(takeUntil(this.destroy$)).subscribe(({ content, label }) => {
            if (this.panelsStack.findIndex(x => x.content === content) !== -1) {
                return;
            }

            const componentFactory = this.cfr.resolveComponentFactory(MobileMenuPanelComponent);
            const componentRef = this.panelsContainer.createComponent(componentFactory);

            componentRef.instance.label = label;
            componentRef.instance.content = content;
            componentRef.instance.level = this.panelsStack.length + 1;

            this.panelsStack.push({ content, componentRef });
            this.currentLevel += 1;

            this.removeUnusedPanels();
        });
        this.menu.onCloseCurrentPanel.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const panel = this.panelsStack.pop();

            if (!panel) {
                return;
            }

            this.panelsBin.push(panel);
            this.currentLevel -= 1;

            if (!isPlatformBrowser(this.platformId)) {
                this.removeUnusedPanels();
            }
        });
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.zone.runOutsideAngular(() => {
                fromEvent<TransitionEvent>(this.body.nativeElement, 'transitionend').pipe(
                    takeUntil(this.destroy$),
                ).subscribe((event) => {
                    if (event.target === this.body.nativeElement && event.propertyName === 'transform' && !this.menu.isOpen) {
                        this.zone.run(() => this.onMenuClosed());
                    }
                });

                fromEvent<TransitionEvent>(this.conveyor.nativeElement, 'transitionend').pipe(
                    takeUntil(this.destroy$),
                ).subscribe((event) => {
                    if (event.target === this.conveyor.nativeElement && event.propertyName === 'transform') {
                        this.zone.run(() => this.onConveyorStopped());
                    }
                });
            });
        }
    }

    public ngAfterViewChecked(): void {
        if (this.forceConveyorTransition) {
            this.forceConveyorTransition = false;

            if (isPlatformBrowser(this.platformId)) {
                this.conveyor.nativeElement.style.transition = 'none';
                this.conveyor.nativeElement.getBoundingClientRect(); // force reflow
                this.conveyor.nativeElement.style.transition = '';
            }
        }
    }

    public onMenuClosed(): void {
        let panel: StackItem|undefined;

        while (panel = this.panelsStack.pop()) {
            this.panelsBin.push(panel);
            this.currentLevel -= 1;
        }

        this.removeUnusedPanels();
        this.forceConveyorTransition = true;
    }

    public onConveyorStopped(): void {
        this.removeUnusedPanels();
    }

    public removeUnusedPanels(): void {
        let panel: StackItem|undefined;

        while (panel = this.panelsBin.pop()) {
            panel.componentRef.destroy();
        }
    }

    public onLinkClick(item: MobileMenuLink): void {
        if (!item.submenu || item.submenu.length < 1) {
            this.menu.close();
        }
    }


    /**
     * Map categories for mobile menu
     */
    public mapCategories(categories: any[]): MobileMenuLink[] {
        // -->Check:
        if (!Array.isArray(categories)) {
            categories = [];
        }
        // -->Init
        const items: MobileMenuLink[] = [];

        // -->Get: route level categories
        const rootLevelCategories = categories.filter(c => (c.parentId === 0 || c.parentId === '0') && c.level === 0);
        // -->Iterate: over categories and set the root level ones
        rootLevelCategories.forEach(category => {
            // -->Create: category
            const item: MobileMenuLink = {
                title: category.name,
                url: `/shop/category/${nameToSlug(category.name)}/${category.id}/products`
            }
            // -->Get: all second level categories for this parent
            const subCategories = categories.filter(c => c.parentId === category.id && c.level === 1);
            if (subCategories.length) {
                // -->Init: submenu
                item.submenu = [];
                // -->Iterate: over subcategories and check if there are any other links inside
                subCategories.forEach(subCategory => {
                    // -->Get: links for sub category
                    const links = categories.filter(c => c.parentId === subCategory.id && c.level === 2);
                    // -->Create: sub category
                    const subCategory$: MobileMenuLink = {
                        title: subCategory.name,
                        url: `/shop/category/${nameToSlug(subCategory.name)}/${subCategory.id}/products`
                    }
                    // -->Check
                    if (links.length) {
                        subCategory$.submenu = links.map(link => {
                            return {
                                title: link.name,
                                url: `/shop/category/${nameToSlug(link.name)}/${link.id}/products`
                            }
                        })
                    }

                    // -->Push: column
                    item.submenu.push(subCategory$);
                })

            }
            // -->Push: category
            items.push(item)

        });


        return items;
    }
}
