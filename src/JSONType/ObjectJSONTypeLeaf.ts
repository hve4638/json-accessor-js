import { JSONTree } from '@/types';
import BaseJSONType from './BaseJSONTypeLeaf';
import { StructJSONTypeData } from './types';

export class StructJSONTypeLeaf extends BaseJSONType {
    declare value:StructJSONTypeData;

    constructor() {
        super('struct');
        // this.value.struct = jsonTree;
    }
}

export default StructJSONTypeLeaf;