import JSONType from '@/features/JSONType';
import type { ValidateJSONTree, ValidateJSONTypeLeaf } from '@/features/JSONType/validator';

/**
 * 타입 검증 테스트
 * IDE에서 타입 에러가 나타나면 실패, 에러가 없으면 성공
 */

// 기본 타입 매핑 테스트
interface BasicSchema {
    str: string;
    num: number;
    bool: boolean;
}

const basicTree = {
    str: JSONType.String(),
    num: JSONType.Number(),
    bool: JSONType.Bool(),
} satisfies ValidateJSONTree<BasicSchema>;

// nullable 타입 테스트
interface NullableSchema {
    name: string | null;
    age: number | null;
}

const nullableTree = {
    name: JSONType.String().nullable(),
    age: JSONType.Number().nullable(),
} satisfies ValidateJSONTree<NullableSchema>;

// Union 타입 테스트 (any로 처리됨)
interface UnionSchema {
    status: 'loading' | 'idle' | 'error';
    priority: 1 | 2 | 3;
}

const unionTree = {
    status: JSONType.Union('loading', 'idle', 'error'),
    priority: JSONType.Union(1, 2, 3),
} satisfies ValidateJSONTree<UnionSchema>;

// 배열 타입 테스트
interface ArraySchema {
    tags: string[];
    scores: number[];
}

const arrayTree = {
    tags: JSONType.Array(JSONType.String()),
    scores: JSONType.Array(JSONType.Number()),
} satisfies ValidateJSONTree<ArraySchema>;

// 중첩 객체 테스트
interface NestedSchema {
    user: {
        name: string;
        age: number;
    };
}

const nestedTree = {
    user: {
        name: JSONType.String(),
        age: JSONType.Number(),
    },
} satisfies ValidateJSONTree<NestedSchema>;

// unknown/any 타입 테스트
interface AnySchema {
    data: unknown;
    payload: any;
}

const anyTree = {
    data: JSONType.Any(),
    payload: JSONType.Any(),
} satisfies ValidateJSONTree<AnySchema>;

// 복합 테스트
interface ComplexSchema {
    id: string;
    count: number;
    active: boolean;
    tags: string[];
    status: 'draft' | 'published';
    metadata: {
        createdAt: string;
        updatedAt: string;
    };
    extra: unknown;
}

const complexTree = {
    id: JSONType.String(),
    count: JSONType.Number(),
    active: JSONType.Bool(),
    tags: JSONType.Array(JSONType.String()),
    status: JSONType.Union('draft', 'published'),
    metadata: {
        createdAt: JSONType.String(),
        updatedAt: JSONType.String(),
    },
    extra: JSONType.Any(),
} satisfies ValidateJSONTree<ComplexSchema>;

// ValidateJSONTypeLeaf 단일 타입 테스트
type StringLeaf = ValidateJSONTypeLeaf<string>;
type NumberLeaf = ValidateJSONTypeLeaf<number>;
type BooleanLeaf = ValidateJSONTypeLeaf<boolean>;
type ArrayLeaf = ValidateJSONTypeLeaf<string[]>;
type UnionLeaf = ValidateJSONTypeLeaf<'a' | 'b'>;

const _stringLeaf: StringLeaf = JSONType.String();
const _numberLeaf: NumberLeaf = JSONType.Number();
const _booleanLeaf: BooleanLeaf = JSONType.Bool();
const _arrayLeaf: ArrayLeaf = JSONType.Array(JSONType.String());
const _unionLeaf: UnionLeaf = JSONType.Union('a', 'b');

// 더미 테스트 (jest 실행 시 통과용)
describe('ValidateJSONTree', () => {
    it('should compile without type errors', () => {
        expect(basicTree).toBeDefined();
        expect(nullableTree).toBeDefined();
        expect(unionTree).toBeDefined();
        expect(arrayTree).toBeDefined();
        expect(nestedTree).toBeDefined();
        expect(anyTree).toBeDefined();
        expect(complexTree).toBeDefined();
    });
});
