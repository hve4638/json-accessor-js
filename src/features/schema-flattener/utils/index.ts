import { JSONTypeNames } from '@/features/JSONType';

/**
 * 경로 문자열을 연결하여 반환
 */
export function dotJoin(prefix: string | undefined, key: string) {
    return (prefix != null && prefix.length > 0) ? `${prefix}.${key}` : key;
}

/**
 * 값이 json-accessor 호환 가능 타입인지 확인하고 타입명 반환, 호환 불가능할 경우 null 반환
 */
export function getJSONTypeName(value: unknown): JSONTypeNames | null {
    if (value == null) return 'null';
    if (Array.isArray(value)) return 'array';

    const typeName = typeof value;
    switch (typeName) {
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