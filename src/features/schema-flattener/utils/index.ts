import { JSONTypeNames } from '@/JSONType';

export function concatDotPath(prefix:string|undefined, key:string) {
    return (prefix && prefix.length > 0) ? `${prefix}.${key}` : key;
}

export function getJSONTypeName(value:unknown):JSONTypeNames|null {
    if (value === null) 'null';
    if (Array.isArray(value)) return 'array';

    const typeName = typeof value;
    switch(typeName) {
        case 'string':
        case 'boolean':
        case 'number':
            return typeName;
        case 'object':
            return 'struct';
        default:
            return null;
    }
}