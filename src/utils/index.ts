import { JSONTypeData, JSONTypeNames } from '@/JSONType';

export function getJSONTypeName(value:string):JSONTypeNames|null {
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

export function isDataTypeCompatible(target:string, jsonTypeData:JSONTypeData|string|number|boolean):boolean {
    if (typeof jsonTypeData === 'object') {
        const targetType = getJSONTypeName(target);

        if (targetType === null) {
            return false;
        }
        else if (targetType === 'null') {
            return jsonTypeData.nullable;
        }
        else if (jsonTypeData.type === 'any') {
            return true;
        }
        else if (jsonTypeData.type === 'union') {
            for (const candidate of jsonTypeData.candidates) {
                if (isDataTypeCompatible(target, candidate)) {
                    return true;
                }
            }
            return false;
        }
        else {
            return (targetType === jsonTypeData.type);
        }
    }
    else {
        return target === jsonTypeData;
    }
}

/**
 * 중첩된 객체의 경로를 찾아, 마지막 객체와 키를 반환
 * 
 * @param contents 객체
 * @param target "."로 구분되는 경로 문자열. 예) "layer1.layer2.item"
 * @param createIfMissing 경로 중간에 객체가 없을 경우, 생성할지 여부. false인 경우 undefined 반환
 * @returns 
 */
export function resolveNestedRef(contents:Record<string,any>, target:string, createIfMissing:boolean=false):{parent:Record<string,any>, key:string }|undefined {
    if (target === '') return undefined;
    const keys = target.split('.');

    let ref:any = contents;

    const size = keys.length-1;
    for (let i=0; i<size; i++) {
        const key = keys[i];
        if (!(key in ref)) {
            if (!createIfMissing) return undefined;

            ref[key] = {};
        }
        ref = ref[key];
    }
    return {
        parent: ref,
        key : keys[size],
    }
}