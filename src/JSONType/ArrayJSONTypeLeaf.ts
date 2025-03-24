import { JSONTree } from '@/types';
import BaseJSONType from './BaseJSONTypeLeaf';

export class ArrayJSONTypeLeaf extends BaseJSONType {
    constructor(jsonTree?:JSONTree) {
        super('array');
        this.value['struct'] = jsonTree;
    }
}

export default ArrayJSONTypeLeaf;