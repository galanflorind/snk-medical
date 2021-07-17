import { FilterHandler } from '../filter.handler';
import { ActiveFilterCheck, CheckFilter } from '../../../../interfaces/filter';


export class FilterCheckHandler extends FilterHandler {
    public type = 'check';

    public serialize(value: string[]): string {
        return value.join(',');
    }

    public deserialize(value: string): string[] {
        return value !== '' ? value.split(',') : [];
    }

    public isDefaultValue(filter: CheckFilter, value: string[]): boolean {
        return value.length === 0;
    }

    public activeFilters(filter: CheckFilter): ActiveFilterCheck[] {
        if (this.isDefaultValue(filter, filter.value)) {
            return [];
        }

        return filter.items.filter(x => filter.value.includes(x.slug)).map(item => ({
            id: `${filter.slug}/${item.slug}`,
            type: filter.type,
            original: filter,
            item,
        }));
    }

    public getResetValue(activeFilters: ActiveFilterCheck[]): string {
        const itemSlugs = activeFilters.map(x => x.item.slug);

        return this.serialize(activeFilters[0].original.value.filter(x => !itemSlugs.includes(x)));
    }
}
