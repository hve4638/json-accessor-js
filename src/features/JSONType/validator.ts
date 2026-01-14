import type {
    StringJSONTypeLeaf,
    NumberJSONTypeLeaf,
    BooleanJSONTypeLeaf,
    ArrayJSONTypeLeaf,
    StructJSONTypeLeaf,
    ReplaceJSONTypeLeaf,
    BaseJSONTypeLeaf,
    UnionJSONTypeLeaf,
} from './leaf';

/** Union 타입 감지 */
type IsUnion<T, U = T> = T extends U
    ? [U] extends [T] ? false : true
    : never;

type AnyJSONTypeLeaf = BaseJSONTypeLeaf | UnionJSONTypeLeaf;

export type StructWithTree<T> = StructJSONTypeLeaf & { __tree: JSONTreeFor<T> };
export type ReplaceWithTree<T> = ReplaceJSONTypeLeaf & { __tree: JSONTreeFor<T> };

export type SchemaFromTree<TTree> = {
    [K in keyof TTree]:
        TTree[K] extends StringJSONTypeLeaf ? string :
        TTree[K] extends NumberJSONTypeLeaf ? number :
        TTree[K] extends BooleanJSONTypeLeaf ? boolean :
        TTree[K] extends ArrayJSONTypeLeaf ? unknown[] :
        TTree[K] extends StructJSONTypeLeaf ? Record<string, unknown> :
        TTree[K] extends ReplaceJSONTypeLeaf ? Record<string, unknown> :
        TTree[K] extends BaseJSONTypeLeaf ? unknown :
        TTree[K] extends UnionJSONTypeLeaf ? unknown :
        TTree[K] extends Record<string, unknown> ? SchemaFromTree<TTree[K]> :
        unknown;
};

/** TypeScript 타입 → 기대되는 JSONType Leaf 추론 */
type ExpectedJSONTypeLeaf<T> =
    [null] extends [T]
        ? ExpectedJSONTypeLeafCore<Exclude<T, null>>
        : ExpectedJSONTypeLeafCore<T>;

type ExpectedJSONTypeLeafCore<T> =
    unknown extends T ? AnyJSONTypeLeaf :
    // 기본 타입을 먼저 체크 (boolean은 true | false union이므로 IsUnion보다 먼저)
    T extends string ? StringJSONTypeLeaf :
    T extends number ? NumberJSONTypeLeaf :
    T extends boolean ? BooleanJSONTypeLeaf :
    T extends (infer U)[] ? ArrayJSONTypeLeaf :
    // 기본 타입이 아닌 union만 AnyJSONTypeLeaf로 처리
    IsUnion<T> extends true ? AnyJSONTypeLeaf :
    T extends Record<string, unknown>
        ? string extends keyof T
            ? StructJSONTypeLeaf | ReplaceJSONTypeLeaf | JSONTreeFor<T>
            : keyof T extends never
                ? StructJSONTypeLeaf | ReplaceJSONTypeLeaf | JSONTreeFor<T>
                : StructWithTree<T> | ReplaceWithTree<T> | JSONTreeFor<T>
        :
    AnyJSONTypeLeaf;

type JSONTreeFor<T> = {
    [K in keyof T]: ExpectedJSONTypeLeaf<T[K]>;
};

/**
 * TypeScript 인터페이스와 JSONType 스키마의 일치 여부를 컴파일 타임에 검증합니다.
 *
 * @example
 * interface MySchema {
 *     name: string;
 *     age: number;
 *     status: 'active' | 'inactive';  // union은 any로 처리
 * }
 *
 * const tree = {
 *     name: JSONType.String(),
 *     age: JSONType.Number(),
 *     status: JSONType.Union('active', 'inactive'),
 * } satisfies ValidateJSONTree<MySchema>;
 */
export type ValidateJSONTree<Schema> = JSONTreeFor<Schema>;

/**
 * 단일 TypeScript 타입에 대한 기대되는 JSONType Leaf를 추론합니다.
 */
export type ValidateJSONTypeLeaf<T> = ExpectedJSONTypeLeaf<T>;
