import { JSONTree } from "@/types";
import { JSON_TYPE_FLAG } from "./data";

export type JSONTypeNames = 'string' | 'number' | 'boolean' | 'array' | 'struct' | 'union' | 'any' | 'null';

type BaseJSONTypeData = {
    [JSON_TYPE_FLAG]: true;
    type: JSONTypeNames,
}
export type PrimitiveJSONTypeData = BaseJSONTypeData & {
    type: 'string' | 'number' | 'boolean' | 'any',
    nullable: boolean,
    default_value: unknown,
}
export type ArrayJSONTypeData = BaseJSONTypeData & {
    type: 'array',

    element?: JSONTypeData,

    strict: boolean,
    nullable: boolean,
    default_value: unknown,
}
export type StructJSONTypeData = {
    type: 'struct',
    struct?: JSONTree,

    strict: boolean,
    nullable: boolean,
    default_value: unknown,
}
export type UnionJSONTypeData = BaseJSONTypeData & {
    type: 'union',
    candidates: (JSONTypeData | string | number | boolean)[],
    nullable: boolean,
    default_value: unknown,
}

export type JSONTypeData = PrimitiveJSONTypeData | ArrayJSONTypeData | StructJSONTypeData | UnionJSONTypeData;