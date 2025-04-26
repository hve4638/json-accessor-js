import TreeNavigate from 'tree-navigate';
import { isJSONTypeData, JSONTypeData } from '@/JSONType';
import { StructJSONTypeData } from '@/JSONType/types';
import { JSONAccessorError } from '@/errors';
import { isObject } from '@/utils';
import { concatDotPath, getJSONTypeName } from './utils';
import { ICompatibilityChecker } from './types';

type FlatArgs = {
    target: Record<string, any>;
    prefix: string;
}

type FlatStructArgs = {
    target: Record<string, any>;
    prefix: string;
    structData: StructJSONTypeData;
}

const DELIMITER = '.';

export class Flattener {
    constructor(
        private navigate: TreeNavigate<JSONTypeData>|undefined,
        private typeChecker: ICompatibilityChecker
    ) {
        
    }

    /**
     * key-value 에 대한 경로 유효성 검사
     */
    transform(key:string, value:unknown) {
        if (key === '') {
            throw new JSONAccessorError(`Invalid path: ${key}`);
        }
        if (this.navigate == null) {
            return [[key, value]];
        }
        
        const traceResult = this.navigate.trace(key);
        if (traceResult.find) {
            if (traceResult.isLeaf) {
                const node = traceResult.value;

                this.typeChecker.check(key, value, node);
                if (node.type === 'struct') {
                    // struct 형식인 value에 대한 구조 검사
                    this.flatStruct({
                        target : value as Record<string, any>,
                        prefix : key,
                        structData : node,
                    });
                }

                return [[key, value]];
            }
            else {
                if (!isObject(value)) {
                    throw new JSONAccessorError(`Field '${key}' is not allowed`);
                }

                return this.flat({
                    target : value,
                    prefix : key,
                });
            }
        }
        else {
            // 경로상 존재하지 않는 경우
            // 닿을 수 있는 마지막 노드의 타입이 struct, any 라면 허용됨
            const { tracePath } = traceResult;

            const reached = tracePath.join(DELIMITER);
            const node = this.navigate.get(reached);
            if (!node || (node.type !== 'struct' && node.type !== 'any')) {
                throw new JSONAccessorError(`Field '${key}' is not allowed`);
            }

            return [[key, value]];
        }
    }

    flat({ target, prefix, }:FlatArgs) {
        if (!this.navigate) {
            return this.flatWithoutNavigate({ target, prefix });
        }
        const navigate = this.navigate;

        return Object.entries(target).flatMap(([key, value]) => {
            const newKey = concatDotPath(prefix, key);
            
            const node = navigate.get(newKey, { allowIntermediate: true });
            if (node == null) {
                throw new JSONAccessorError(`Field '${newKey}' is not allowed`);
            }
            else if (isJSONTypeData(node)) {
                this.typeChecker.check(newKey, value, node);
                
                // @TODO : 배열 타입에 대한 세부 처리 필요
                // 현재는 배열 경로까지만 flat이 이루어지므로
                // get/set 시 배열 전체를 가져오거나 덮어쓰게됨
                if (node.type === 'any') {
                    return this.flatWithoutNavigate({
                        target : value,
                        prefix : newKey,
                    });
                }
                else if (node.type === 'struct') {
                    return this.flatStruct({
                        target : value,
                        prefix : newKey,
                        structData : node,
                    });
                }
                else {
                    return [[newKey, value]];
                }
            }
            else if (isObject(value)) {
                return this.flat({
                    target : value,
                    prefix : newKey,
                });
            }
            else {
                throw new JSONAccessorError(`Logic error: ${newKey}`);
            }
        });
    }
    
    /**
     * struct 노드에 대한 flatten 수행
     */
    private flatStruct({ target, prefix, structData }:FlatStructArgs): [string, any][] {
        // struct는 내부 구조에 대한 구조 검증이 없으므로 유효성 검증 없이 단순 평탄화
        return Object.entries(target).flatMap(([key, value]) => {
            const newKey = concatDotPath(prefix, key);

            if (isObject(value)) {
                return this.flatWithoutNavigate({
                    target : value,
                    prefix : newKey,
                });
            }
            else {
                return [[newKey, value]];
            }
        });
    }

    /**
     * 유효성 검증 없이 flatten 수행
     */
    private flatWithoutNavigate({ target, prefix }:FlatArgs): [string, any][] {
        return Object.entries(target).flatMap(([key, value]) => {
            const newKey = concatDotPath(prefix, key);

            if (isObject(value)) {
                return this.flatWithoutNavigate({
                    target : value,
                    prefix : newKey,
                });
            }
            else {
                return [[newKey, value]];
            }
        });
    }
}
