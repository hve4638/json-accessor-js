import JSONType from '@/features/JSONType';
import type { ValidateJSONTree } from '@/features/JSONType/validator';

/**
 * 모든 타입 조합 에러 체크
 * 각 인터페이스에 잘못된 JSONType을 할당하여 에러가 발생하는지 확인
 */

// === String 필드에 다른 타입 할당 ===
interface StringSchema { field: string; }

const stringWithNumber = {
    // @ts-expect-error - invalid JSONType for string schema
    field: JSONType.Number(),  // string에 Number - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

const stringWithBool = {
    // @ts-expect-error - invalid JSONType for string schema
    field: JSONType.Bool(),    // string에 Bool - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

const stringWithArray = {
    // @ts-expect-error - invalid JSONType for string schema
    field: JSONType.Array(),   // string에 Array - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

const stringWithStruct = {
    // @ts-expect-error - invalid JSONType for string schema
    field: JSONType.Struct(),  // string에 Struct - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

const stringWithReplace = {
    // @ts-expect-error - invalid JSONType for string schema
    field: JSONType.Replace(),  // string에 Replace - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

// === 중첩 객체에 빈 Struct/Replace 할당 ===
interface NestedSchema { field: { inner: string }; }

const nestedWithStruct = {
    // @ts-expect-error - invalid JSONType for nested schema
    field: JSONType.Struct(),  // 중첩 구조에 Struct() - 에러 나야 함
} satisfies ValidateJSONTree<NestedSchema>;

const nestedWithReplace = {
    // @ts-expect-error - invalid JSONType for nested schema
    field: JSONType.Replace(),  // 중첩 구조에 Replace() - 에러 나야 함
} satisfies ValidateJSONTree<NestedSchema>;

// === Number 필드에 다른 타입 할당 ===
interface NumberSchema { field: number; }

const numberWithString = {
    // @ts-expect-error - invalid JSONType for number schema
    field: JSONType.String(),  // number에 String - 에러 나야 함
} satisfies ValidateJSONTree<NumberSchema>;

const numberWithBool = {
    // @ts-expect-error - invalid JSONType for number schema
    field: JSONType.Bool(),    // number에 Bool - 에러 나야 함
} satisfies ValidateJSONTree<NumberSchema>;

const numberWithArray = {
    // @ts-expect-error - invalid JSONType for number schema
    field: JSONType.Array(),   // number에 Array - 에러 나야 함
} satisfies ValidateJSONTree<NumberSchema>;

const numberWithStruct = {
    // @ts-expect-error - invalid JSONType for number schema
    field: JSONType.Struct(),  // number에 Struct - 에러 나야 함
} satisfies ValidateJSONTree<NumberSchema>;

// === Boolean 필드에 다른 타입 할당 ===
interface BooleanSchema { field: boolean; }

const boolWithString = {
    // @ts-expect-error - invalid JSONType for boolean schema
    field: JSONType.String(),  // boolean에 String - 에러 나야 함
} satisfies ValidateJSONTree<BooleanSchema>;

const boolWithNumber = {
    // @ts-expect-error - invalid JSONType for boolean schema
    field: JSONType.Number(),  // boolean에 Number - 에러 나야 함
} satisfies ValidateJSONTree<BooleanSchema>;

const boolWithArray = {
    // @ts-expect-error - invalid JSONType for boolean schema
    field: JSONType.Array(),   // boolean에 Array - 에러 나야 함
} satisfies ValidateJSONTree<BooleanSchema>;

const boolWithStruct = {
    // @ts-expect-error - invalid JSONType for boolean schema
    field: JSONType.Struct(),  // boolean에 Struct - 에러 나야 함
} satisfies ValidateJSONTree<BooleanSchema>;

// === Array 필드에 다른 타입 할당 ===
interface ArraySchema { field: string[]; }

const arrayWithString = {
    // @ts-expect-error
    field: JSONType.String(),  // array에 String - 에러 나야 함
} satisfies ValidateJSONTree<ArraySchema>;

const arrayWithNumber = {
    // @ts-expect-error
    field: JSONType.Number(),  // array에 Number - 에러 나야 함
} satisfies ValidateJSONTree<ArraySchema>;

const arrayWithBool = {
    // @ts-expect-error
    field: JSONType.Bool(),    // array에 Bool - 에러 나야 함
} satisfies ValidateJSONTree<ArraySchema>;

const arrayWithStruct = {
    // @ts-expect-error
    field: JSONType.Struct(),  // array에 Struct - 에러 나야 함
} satisfies ValidateJSONTree<ArraySchema>;

// 더미 테스트
describe('ValidateJSONTree error detection', () => {
    it('placeholder', () => {
        expect(true).toBe(true);
    });
});
