import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stockToStatusBadgeText',
})
export class StockToStatusBadgeTextPipe implements PipeTransform {
    transform(value: number): string {
        // todo: we need to check if an item is on backorder and show `TEXT_STOCK_ON_BACKORDER`
        return !isNaN(value) && value > 0 ? 'TEXT_STOCK_IN_STOCK' : 'TEXT_STOCK_OUT_OF_STOCK'
    }
}
