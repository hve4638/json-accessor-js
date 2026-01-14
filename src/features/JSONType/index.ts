import { BooleanJSONTypeLeaf, NumberJSONTypeLeaf, StringJSONTypeLeaf } from './PrimitiveJSONTypeLeaves';
import { default as JSONTypeObject, ReplaceJSONTypeLeaf } from './ObjectJSONTypeLeaf';
import JSONTypeArray from './ArrayJSONTypeLeaf';
import BaseJSONType from './BaseJSONTypeLeaf';
import { JSONTree } from '@/types';
import { JSON_TYPE_FLAG } from './data';
import { JSONTypeData } from './types';
import UnionJSONTypeLeaf from './UnionJSONTypeLeaf';
import type { ReplaceWithTree, SchemaFromTree, StructWithTree } from './validator';
export type { JSONTypeNames, JSONTypeData } from './types';

export function isJSONTypeData(target: object): target is JSONTypeData {
    return (
        target != null &&
        typeof target === 'object' &&
        target[JSON_TYPE_FLAG] === true
    );
}

function Struct<TTree extends JSONTree>(tree: TTree): StructWithTree<SchemaFromTree<TTree>>;
function Struct(tree?: JSONTree): JSONTypeObject;
function Struct(tree?: JSONTree) {
    return new JSONTypeObject(tree);
}

function Replace<TTree extends JSONTree>(tree: TTree): ReplaceWithTree<SchemaFromTree<TTree>>;
function Replace(tree?: JSONTree): ReplaceJSONTypeLeaf;
function Replace(tree?: JSONTree) {
    return new ReplaceJSONTypeLeaf(tree);
}

const JSONType = {
    Union: (...candidates: (string | number | boolean | null | undefined | BaseJSONType)[]) => new UnionJSONTypeLeaf(...candidates),
    String: () => new StringJSONTypeLeaf(),
    Number: () => new NumberJSONTypeLeaf(),
    Bool: () => new BooleanJSONTypeLeaf(),
    Struct,
    Replace,
    Array: (jsonTree?: JSONTree | BaseJSONType) => new JSONTypeArray(jsonTree),
    Any: () => new BaseJSONType('any'),
};
export type JSONTypeLeaf = StringJSONTypeLeaf | NumberJSONTypeLeaf | BooleanJSONTypeLeaf | JSONTypeObject | ReplaceJSONTypeLeaf | JSONTypeArray | BaseJSONType;

export default JSONType;
