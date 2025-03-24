import { JSONAccessorError } from '@/errors';
import { isJSONTypeData, JSONTypeData } from '@/JSONType';
import { StructJSONTypeData } from '@/JSONType/types';
import { getJSONTypeName, isDataTypeCompatible } from '@/utils';
import TreeNavigate from 'tree-navigate';

type TransformArgs = {
    key : string;
    value : unknown;
    navigator: TreeNavigate<JSONTypeData>;
}

type TransformInStructArgs = {
    prefix:string;
    key : string;
    value : unknown;
    structData: StructJSONTypeData;
}

type FlatArgs = {
    target: Record<string, any>;
    prefix: string;
    navigator: TreeNavigate<JSONTypeData>;
}

type FlatWithoutNavigateArgs = {
    target: Record<string, any>;
    prefix: string;
}

type FlatInStructArgs = {
    target: Record<string, any>;
    prefix: string;
    structData: StructJSONTypeData;
}

class ObjectFlatter {
    #treeNavigate: TreeNavigate<JSONTypeData>|undefined;
    #structTreeNavigates: Record<string, TreeNavigate<JSONTypeData>> = {};
    #delimiter = '.';

    constructor(jsonTreeNavigate?: TreeNavigate<JSONTypeData>) {
        this.#treeNavigate = jsonTreeNavigate;
    }

    /**
     * [string, any] 형식의 데이터에 대한 유효성 검사 후 변환.
     * 
     * 현 구현에서는 입력 값 그대로 반환되며 유효성 검사만 진행됨.
     * 
     * @param data [key, value] 형식의 배열
     * @returns 
     */
    transform(data:[string, any][]):[string, any][] {
        return data.flatMap(([key, value]) => {
            if (this.#treeNavigate) {
                return this.#transform({
                    key : key,
                    value : value,
                    navigator : this.#treeNavigate,
                });
            }
            else {
                return [[key, value]];
            }
        });
    }

    #transform({key, value, navigator}:TransformArgs):[string, any][] {
        if (key === '') {
            throw new JSONAccessorError(`Invalid path: ${key}`);
        }
        if (this.#treeNavigate == null) return [[key, value]];
        
        const traceResult = this.#treeNavigate.trace(key);
        if (traceResult.find) {
            if (traceResult.isLeaf) {
                const node = traceResult.value;

                ObjectFlatter.#checkDataCompatible(key, value, node);
                if (node.type === 'struct') {
                    // struct 형식인 value에 대한 구조 검사
                    this.#flatInStruct({
                        target : value as Record<string, any>,
                        prefix : key,
                        structData : node,
                    });
                }

                return [[key, value]];
            }
            else {
                if (!ObjectFlatter.#isObject(value)) {
                    throw new JSONAccessorError(`Field '${key}' is not allowed to be set`);
                }

                return this.#flat({
                    target : value,
                    prefix : key,
                    navigator : this.#treeNavigate,
                });
            }
        }
        else {
            const { tracePath } = traceResult;

            const reached = tracePath.join(this.#delimiter);
            const node = this.#treeNavigate.get(reached);
            if (!node || (node.type !== 'struct' && node.type !== 'any')) {
                throw new JSONAccessorError(`Field '${key}' is not allowed to be set`);
            }

            return [[key, value]];
        }
    };

    /**
     * nested object 구조를 [[key, value], ...] 형식으로 변환하고 tree 구조에 대한 유효성 검사 수행
     * 
     * @param target
     */
    flat(target: Record<string, any>):[string, any][] {
        if (this.#treeNavigate) {
            return this.#flat({
                target : target,
                prefix : '',
                navigator : this.#treeNavigate,
            });
        }
        else {
            return this.#flatWithoutNavigate({
                target : target,
                prefix : '',
            });
        }
    }

    #flat({ target, prefix, navigator }:FlatArgs): [string, any][] {
        return Object.entries(target).flatMap(([key, value]) => {
            const newKey = ObjectFlatter.#joinKey(prefix, key);
            
            const node = navigator.get(newKey, { allowIntermediate: true });
            if (node == null) {
                throw new JSONAccessorError(`Field '${newKey}' is not allowed to be set`);
            }
            else if (isJSONTypeData(node)) {
                ObjectFlatter.#checkDataCompatible(newKey, value, node);
                
                // @TODO : 배열 타입에 대한 세부 처리 필요
                // 현재는 배열 경로까지만 flat이 이루어지므로
                // get/set 시 배열 전체를 가져오거나 덮어쓰게됨
                if (node.type === 'any') {
                    return this.#flatWithoutNavigate({
                        target : value,
                        prefix : newKey,
                    });
                }
                else if (node.type === 'struct') {
                    return this.#flatInStruct({
                        target : value,
                        prefix : newKey,
                        structData : node,
                    });
                }
                else {
                    return [[newKey, value]];
                }

                return [[newKey, value]];
            }
            else if (ObjectFlatter.#isObject(value)) {
                return this.#flat({
                    target : value,
                    prefix : newKey,
                    navigator : navigator,
                });
            }
            else {
                throw new JSONAccessorError(`Logic error: ${newKey}`);
            }
        });
    }

    #flatWithoutNavigate({ target, prefix }:FlatWithoutNavigateArgs): [string, any][] {
        return Object.entries(target).flatMap(([key, value]) => {
            const newKey = ObjectFlatter.#joinKey(prefix, key);

            if (ObjectFlatter.#isObject(value)) {
                return this.#flatWithoutNavigate({
                    target : value,
                    prefix : newKey,
                });
            }
            else {
                return [[newKey, value]];
            }
        });
    }

    #flatInStruct({ target, prefix, structData }:FlatInStructArgs): [string, any][] {
        let navigate = this.#getStructNavigator(prefix, structData);
        
        return Object.entries(target).flatMap(([key, value]) => {
            const newKey = ObjectFlatter.#joinKey(prefix, key);
            if (navigate) {
                return this.#flat({
                    target : value,
                    prefix : newKey,
                    navigator : navigate,
                });
            }
            else {
                return this.#flatWithoutNavigate({
                    target : value,
                    prefix : newKey,
                });
            }
        });
    }

    #getStructNavigator(path:string, node:JSONTypeData & { type:'struct' }):TreeNavigate<JSONTypeData>|null {
        if (node.struct == null) {
            return null;
        }
        else if (path in this.#structTreeNavigates) {
            return this.#structTreeNavigates[path];
        }
        else {
            const navigate = TreeNavigate.from(node.struct);
            this.#structTreeNavigates[path] = navigate;
            return navigate;
        }
    }

    static #isObject(value:any): value is Record<string, any> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    static #joinKey(prefix:string|undefined, key:string) {
        return prefix ? `${prefix}.${key}` : key;
    }

    static #checkDataCompatible(key:string, value:any, typeData:JSONTypeData) {
        if (!isDataTypeCompatible(value, typeData)) {
            const typeName = getJSONTypeName(value);
            if (typeName == null) {
                throw new JSONAccessorError(`Invalid data type: ${typeof value} in '${key}'`);
            }
            else if (typeName === 'null') {
                throw new JSONAccessorError(`Field '${key}' is not nullable`);
            }
            else {
                throw new JSONAccessorError(`Field '${key}' must be a '${typeData.type}' but ${typeof value}}`);
            }
        }
    }
}

export default ObjectFlatter;