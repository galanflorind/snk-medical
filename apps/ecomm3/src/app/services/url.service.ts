import { Injectable } from '@angular/core';
import { Category, ShopCategory } from '../interfaces/category';
import { Order } from '../interfaces/order';
import { Product } from '../interfaces/product';
import { Brand } from '../interfaces/brand';
import { nameToSlug } from "../../fake-server/utils";
import { NaoUsersInterface } from "@naologic/nao-user-access";

@Injectable({
    providedIn: 'root',
})
export class UrlService {
    constructor() { }

    public home(): string {
        return '/';
    }

    public shop(): string {
        return '/shop';
    }

    public category(category: Category): string {
        return this.shopCategory(category);
    }

    public shopCategory(category: ShopCategory): string {
        // -->Slugify: the category name
        const categorySlug = nameToSlug(category.name);
        // -->Return: category url
        return `/shop/category/${categorySlug}/${category.id}/products`;
    }

    public allProducts(): string {
        return '/shop/category/products';
    }

    public product(product: Product): string {
        if (!product.data?.name) {
            return '';
        }
        // -->Slugify: the product name
        const productSlug = nameToSlug(product.data.name);
        // -->Return: product url
        return `/shop/products/${productSlug}/${product._id}`;
    }

    public brand(brand: Brand): string {
        return '/';
    }

    public address(address: NaoUsersInterface.Address): string {
        return `/account/addresses/${address.id}`;
    }

    public order(order: Order): string {
        return `/account/orders/${order.id}`;
    }

    public cart(): string {
        return '/shop/cart';
    }

    public checkout(): string {
        return '/shop/checkout';
    }

    public login(): string {
        return '/account/login';
    }

    public contacts(): string {
        return '/site/contact-us-v1';
    }
}
