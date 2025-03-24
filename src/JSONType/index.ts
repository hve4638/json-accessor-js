import { BooleanJSONTypeLeaf, NumberJSONTypeLeaf, StringJSONTypeLeaf } from './PrimitiveJSONTypeLeaves';
import { default as JSONTypeObject } from './ObjectJSONTypeLeaf';
import JSONTypeArray from './ArrayJSONTypeLeaf';
import BaseJSONType from './BaseJSONTypeLeaf';
import { JSONTree } from '@/types';
import { JSON_TYPE_FLAG } from './data';
import { JSONTypeData } from './types';
export type { JSONTypeNames, JSONTypeData } from './types';

export function isJSONTypeData(target:object):target is JSONTypeData {
    return target != null && typeof target === 'object' && target[JSON_TYPE_FLAG] === true;
}

const JSONType = {
    String : () => new StringJSONTypeLeaf(),
    Number : () => new NumberJSONTypeLeaf(),
    Bool : () => new BooleanJSONTypeLeaf(),
    Struct : () => new JSONTypeObject(),
    Array : (jsonTree?:JSONTree) => new JSONTypeArray(jsonTree),
    Any : () => new BaseJSONType('any'),
};
export type JSONTypeLeaf = StringJSONTypeLeaf | NumberJSONTypeLeaf | BooleanJSONTypeLeaf | JSONTypeObject | JSONTypeArray | BaseJSONType;

export default JSONType;