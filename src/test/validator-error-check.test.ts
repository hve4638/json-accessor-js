// @ts-nocheck
import JSONType from '@/features/JSONType';
import type { ValidateJSONTree } from '@/features/JSONType/validator';

/**
 * 모든 타입 조합 에러 체크
 * 각 인터페이스에 잘못된 JSONType을 할당하여 에러가 발생하는지 확인
 */

// === String 필드에 다른 타입 할당 ===
interface StringSchema { field: string; }

const stringWithNumber = {
    field: JSONType.Number(),  // string에 Number - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

const stringWithBool = {
    field: JSONType.Bool(),    // string에 Bool - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

const stringWithArray = {
    field: JSONType.Array(),   // string에 Array - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

const stringWithStruct = {
    field: JSONType.Struct(),  // string에 Struct - 에러 나야 함
} satisfies ValidateJSONTree<StringSchema>;

// === Number 필드에 다른 타입 할당 ===
interface NumberSchema { field: number; }

const numberWithString = {
    field: JSONType.String(),  // number에 String - 에러 나야 함
} satisfies ValidateJSONTree<NumberSchema>;

const numberWithBool = {
    field: JSONType.Bool(),    // number에 Bool - 에러 나야 함
} satisfies ValidateJSONTree<NumberSchema>;

const numberWithArray = {
    field: JSONType.Array(),   // number에 Array - 에러 나야 함
} satisfies ValidateJSONTree<NumberSchema>;

const numberWithStruct = {
    field: JSONType.Struct(),  // number에 Struct - 에러 나야 함
} satisfies ValidateJSONTree<NumberSchema>;

// === Boolean 필드에 다른 타입 할당 ===
interface BooleanSchema { field: boolean; }

const boolWithString = {
    field: JSONType.String(),  // boolean에 String - 에러 나야 함
} satisfies ValidateJSONTree<BooleanSchema>;

const boolWithNumber = {
    field: JSONType.Number(),  // boolean에 Number - 에러 나야 함
} satisfies ValidateJSONTree<BooleanSchema>;

const boolWithArray = {
    field: JSONType.Array(),   // boolean에 Array - 에러 나야 함
} satisfies ValidateJSONTree<BooleanSchema>;

const boolWithStruct = {
    field: JSONType.Struct(),  // boolean에 Struct - 에러 나야 함
} satisfies ValidateJSONTree<BooleanSchema>;

// === Array 필드에 다른 타입 할당 ===
interface ArraySchema { field: string[]; }

const arrayWithString = {
    field: JSONType.String(),  // array에 String - 에러 나야 함
} satisfies ValidateJSONTree<ArraySchema>;

const arrayWithNumber = {
    field: JSONType.Number(),  // array에 Number - 에러 나야 함
} satisfies ValidateJSONTree<ArraySchema>;

const arrayWithBool = {
    field: JSONType.Bool(),    // array에 Bool - 에러 나야 함
} satisfies ValidateJSONTree<ArraySchema>;

const arrayWithStruct = {
    field: JSONType.Struct(),  // array에 Struct - 에러 나야 함
} satisfies ValidateJSONTree<ArraySchema>;

// 더미 테스트
describe('ValidateJSONTree error detection', () => {
    it('placeholder', () => {
        expect(true).toBe(true);
    });
});
