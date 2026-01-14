import TreeNavigate from 'tree-navigate';
import { isJSONTypeData, JSONTypeData } from '@/features/JSONType';
import { StructJSONTypeData } from '@/features/JSONType/types';
import { JSONAccessorError } from '@/errors';
import { isObject } from '@/utils';
import { dotJoin, getJSONTypeName } from './utils';
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
        private navigate: TreeNavigate<JSONTypeData> | undefined,
        private typeChecker: ICompatibilityChecker
    ) { }

    /**
     * key-value 쌍에 대한 경로 유효성 검사후 `Array<[key, value]>` 형태로 반환
     * 
     * @param key - dot(.)으로 구분된 경로 문자열
     * @param value - 유효성 검사를 위한 값
     * @return 인자를 [[key, value]] 형태로 반환
     */
    transform(key: string, value: unknown): [string, unknown][] {
        // [[key, value]] 를 그대로 반환하는건 flat()과의 호환을 위함
        // 추후 구현에서 한 key에서 여러 결과를 리턴하는 등의 확장 가능성이 있음

        if (key === '') {
            // 루트 경로는 비허용
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
                if (value != null && node.type === 'struct') {
                    // struct 형식인 value에 대한 구조 검사
                    this.flatStruct({
                        target: value as Record<string, any>,
                        prefix: key,
                        structData: node,
                    });
                }

                return [[key, value]];
            }
            else {
                // 경로는 존재하지만 노드의 중간인 경우
                // value가 object 형태라면 flat()을 통해 유효성 검사를 진행
                if (!isObject(value)) {
                    throw new JSONAccessorError(`Field '${key}' is not allowed`);
                }

                return this.flat({
                    target: value,
                    prefix: key,
                });
            }
        }
        // 경로상 존재하지 않는 경우
        else if (traceResult.tracePath.length === 0) {
            throw new JSONAccessorError(`Field '${key}' is not allowed`);
        }
        // 중간 경로까지는 존재하는 경우
        else {
            const { tracePath } = traceResult;

            const reached = tracePath.join(DELIMITER);
            const node = this.navigate.get(reached);
            // 닿을 수 있는 마지막 노드의 타입이 struct, replace, any 라면 허용됨
            if (!node || (node.type !== 'struct' && node.type !== 'replace' && node.type !== 'any')) {
                throw new JSONAccessorError(`Field '${key}' is not allowed`);
            }

            return [[key, value]];
        }
    }

    /**
     * 객체를 평탄화하여 `Array<[key, value]>`로 반환 
     * 
     * 유효성 검증을 포함함
     */
    flat({ target, prefix }: FlatArgs): [string, unknown][] {
        if (!this.navigate) {
            return this.flatWithoutNavigate({ target, prefix });
        }
        const navigate = this.navigate;

        return Object.entries(target)
            .flatMap(([key, value]) => {
                const newKey = dotJoin(prefix, key);

                const node = navigate.get(newKey, { allowIntermediate: true });
                if (node == null) {
                    throw new JSONAccessorError(`Field '${newKey}' is not allowed`);
                }
                else if (isJSONTypeData(node)) {
                    this.typeChecker.check(newKey, value, node);

                    if (node.type === 'any') {
                        return this.flatWithoutNavigate({
                            target: value,
                            prefix: newKey,
                        });
                    }
                    else if (node.type === 'struct') {
                        return this.flatStruct({
                            target: value,
                            prefix: newKey,
                            structData: node,
                        });
                    }
                    else if (node.type === 'replace') {
                        // replace 타입은 평탄화 없이 전체 값 반환 → 항상 덮어쓰기
                        return [[newKey, value]];
                    }
                    else if (node.type === 'array') {
                        // @TODO : 배열 타입에 대한 세부 처리 필요
                        // 현재는 배열 경로까지만 flat이 이루어지므로
                        // get/set 시 배열 전체를 가져오거나 덮어쓰게됨

                        return [[newKey, value]];
                    }
                    else {
                        return [[newKey, value]];
                    }
                }
                else if (isObject(value)) {
                    return this.flat({
                        target: value,
                        prefix: newKey,
                    });
                }
                else {
                    // 가져온 값이 JSONTypeData(탐색한 노드의 끝) 도 아니고
                    // 일반 object(중간 노드)도 아닌 다른 타입인 경우
                    //
                    // TreeNavigate<JSONTypeData> 에서 가져온 결과에선 나올 수 없으므로 데이터 오염이라고 판단

                    throw new JSONAccessorError(`Data corrupted: unexpected node type encountered. key: '${newKey}', value: ${value} (${typeof value})`);
                }
            });
    }

    /**
     * struct 노드에 대한 flatten 수행
     */
    private flatStruct({ target, prefix, structData }: FlatStructArgs): [string, any][] {
        // struct는 내부 구조에 대한 구조 검증이 없으므로 유효성 검증 없이 단순 평탄화
        return Object.entries(target)
            .flatMap(([key, value]) => {
                const newKey = dotJoin(prefix, key);

                if (isObject(value)) {
                    return this.flatWithoutNavigate({
                        target: value,
                        prefix: newKey,
                    });
                }
                else {
                    return [[newKey, value]];
                }
            });
    }

    /**
     * 유효성 검증 없이 평탄화 수행
     */
    private flatWithoutNavigate({ target, prefix }: FlatArgs): Array<[string, unknown]> {
        return Object.entries(target)
            .flatMap(([key, value]) => {
                const newKey = dotJoin(prefix, key);

                if (isObject(value)) {
                    return this.flatWithoutNavigate({
                        target: value,
                        prefix: newKey,
                    });
                }
                else {
                    return [[newKey, value]];
                }
            });
    }
}
