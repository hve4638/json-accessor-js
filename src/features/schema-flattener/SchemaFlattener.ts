import TreeNavigate from 'tree-navigate';
import { JSONTypeData } from '@/JSONType';
import { Flattener } from './Flattener';
import CompatibilityChecker from './CompatibilityChecker';

class SchemaFlattener {
    private flattener: Flattener;
    private checker: CompatibilityChecker;

    constructor(navigate?: TreeNavigate<JSONTypeData>) {
        this.checker = new CompatibilityChecker();
        this.flattener = new Flattener(navigate, this.checker);
    }

    flat(target: Record<string, any>):[string, any][] {
        return this.flattener.flat({
            target,
            prefix : '',
        });
    }

    transform(data:[string, any][]):[string, any][] {
        return data.flatMap(([key, value]) => {
            return this.flattener.transform(key, value);
        });
    }
}

export default SchemaFlattener;