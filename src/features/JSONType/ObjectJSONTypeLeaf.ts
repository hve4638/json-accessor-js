import { JSONTree } from '@/types';
import BaseJSONType from './BaseJSONTypeLeaf';
import { StructJSONTypeData } from './types';

export class StructJSONTypeLeaf extends BaseJSONType {
    readonly __brand: 'struct' = 'struct';
    declare value:StructJSONTypeData;

    constructor(tree?:JSONTree) {
        super('struct');
        this.value['struct'] = tree;
        this.value['strict'] = false;
    }

    strict() {
        this.value['strict'] = true;
        return this;
    } 
}

export default StructJSONTypeLeaf;