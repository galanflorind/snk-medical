import { CustomFields } from './custom-fields';
import { Brand } from './brand';
import { ShopCategory } from './category';


export interface BaseAttributeGroup {
    name: string;
    slug: string;
    customFields?: CustomFields;
}

export type ProductAttributeGroup = BaseAttributeGroup & { attributes: ProductAttribute[]; };
export type ProductTypeAttributeGroup = BaseAttributeGroup & { attributes: string[]; };

export interface ProductType {
    name: string;
    slug: string;
    attributeGroups: ProductTypeAttributeGroup[];
    customFields?: CustomFields;
}

export interface ProductAttributeValue {
    name: string;
    slug: string;
    customFields?: CustomFields;
}

export interface ProductAttribute {
    name: string;
    slug: string;
    featured: boolean;
    value?: string;
    values: ProductAttributeValue[];
    customFields?: CustomFields;
}

export interface ProductOptionValueBase {
    name: string;
    slug: string; // todo: remove this
    id?: string;
    customFields?: CustomFields;
}

export interface ProductOptionValueColor extends ProductOptionValueBase {
    color: string;
}

export interface ProductOptionBase {
    type: string;
    name: string;
    id?: string;
    slug: string; // todo: remove this
    values: ProductOptionValueBase[];
    customFields?: CustomFields;
}

export interface ProductOptionDefault extends ProductOptionBase {
    type: 'default';
}

export interface ProductOptionColor extends ProductOptionBase {
    type: 'color';
    values: ProductOptionValueColor[];
}

export type ProductOption = ProductOptionDefault | ProductOptionColor;

export type ProductStock = 'in-stock' | 'out-of-stock' | 'on-backorder';

export type ProductCompatibilityResult = 'all' | 'fit' | 'not-fit' | 'unknown';

export interface Category {
    id: string;
    isFeatured: boolean;
    level: number;
    name: string;
    parentId: number | string;
}


export interface Variant {
    availability: string
    available: boolean
    cost: number
    countryOfOrigin: string
    currency: string
    depth: string
    description: string
    dimensionUOM: string
    height: string
    id: string
    manufacturerItemCode: string
    manufacturerItemId: string
    ndcFreightClass: string
    ndcHarmonizedTariffCode: string
    ndcItemCode: string
    optionId: string
    optionId1: string
    optionId2: string
    optionId3: string
    optionValue: string
    optionValue1: string
    optionValue2: string
    optionValue3: string
    variantName: string
    packaging: string
    price: number
    quantity: number
    sku: string
    volume: string
    volumeUOM: string
    weight: string
    weightUOM: string
    width: string
}

export interface Product {
    _id?: number;
    data?: {
        availability: string;
        available: true;
        barcode?: string;
        categories: Category[]
        currency: string;
        description: string;
        shortDescription: string;
        images: string[];
        isShippable: boolean;
        manufacturerId: string;
        name: string;
        options: any;
        price: number;
        sku: string;
        quantity: number;
        status: string;
        variants: Variant[];
        rating?: any; // todo: this would be for future use
        vendorId;
        manufacturer?: {
            data: {
                name: string;
                manufacturerId: string;
            },
            _id: string;
        }
    }
    // When you do a filter, the manufacturer comes at data level
    // manufacturer?: {
    //     data: {
    //         name: string;
    //         manufacturerId: string;
    //     },
    //     _id: string;
    // }

    /**
     * @deprecated !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! everything below
     */
    name: string;
    id: number;
    /**
     * A short product description without HTML tags.
     */
    excerpt: string;
    description: string;
    slug: string;
    sku?: string;
    partNumber: string;
    stock: ProductStock;
    price: number;
    compareAtPrice: number|null;
    images?: string[];
    badges?: string[];
    rating?: number;
    reviews?: number;
    availability?: string;
    /**
     * 'all'     - Compatible with all vehicles.
     * 'unknown' - No compatibility information. Part may not fit the specified vehicle.
     * number[]  - An array of vehicle identifiers with which this part is compatible.
     */
    compatibility: 'all' | 'unknown' | number[];
    brand?: Brand|null;
    tags?: string[];
    type: ProductType;
    categories?: ShopCategory[];
    attributes: ProductAttribute[];
    options: ProductOption[];
    customFields?: CustomFields;
}
