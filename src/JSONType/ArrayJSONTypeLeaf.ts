import { JSONTree } from '@/types';
import BaseJSONType from './BaseJSONTypeLeaf';
import { default as JSONTypeObject } from './ObjectJSONTypeLeaf';
import { TREE_LEAF_FLAG } from 'tree-navigate';
import { JSONTypeData } from './types';

export class ArrayJSONTypeLeaf extends BaseJSONType {
    constructor(element?:JSONTree|BaseJSONType) {
        super('array');
        this.value['strict'] = false;

        if (element == null) {
            this.value['element'] = undefined;
        }
        else if (TREE_LEAF_FLAG in element) {
            this.value['element'] = (element as BaseJSONType).value;
        }
        else {
            const obj = new JSONTypeObject(element);
            this.value['element'] = obj.strict().value;
        }
    }

    strict() {
        this.value['strict'] = true;
        return this;
    }
}

export default ArrayJSONTypeLeaf;