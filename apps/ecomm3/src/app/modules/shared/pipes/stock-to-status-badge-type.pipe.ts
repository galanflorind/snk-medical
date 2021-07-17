import { Pipe, PipeTransform } from '@angular/core';
import { StatusBadgeType } from '../components/status-badge/status-badge.component';

@Pipe({
    name: 'stockToStatusBadgeType',
})
export class StockToStatusBadgeTypePipe implements PipeTransform {
    transform(value: number): StatusBadgeType {
        // todo: we need to check if an item is on backorder and show `warning`
        return !isNaN(value) && value > 0 ? 'success' : 'failure'
    }
}
