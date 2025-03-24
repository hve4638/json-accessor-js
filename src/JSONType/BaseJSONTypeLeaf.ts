import { TREE_LEAF_FLAG } from 'tree-navigate';
import { JSON_TYPE_FLAG } from './data';
import { JSONTypeData, JSONTypeNames } from './types';

class BaseJSONTypeLeaf {
    [TREE_LEAF_FLAG]=true;
    value:JSONTypeData;

    constructor(type:Exclude<JSONTypeNames, 'null'>) {
        this.value = {
            [JSON_TYPE_FLAG] : true,
            type,
            default_value : undefined,
            nullable : false
        }
    }

    nullable() {
        this.value.nullable = true;
        return this;
    }

    toJSON() {
        return {
            [TREE_LEAF_FLAG] : true,
            value : this.value
        }
    }
}

export default BaseJSONTypeLeaf;