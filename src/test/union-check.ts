// IsUnion 타입 테스트

type IsUnion<T, U = T> = T extends U
    ? [U] extends [T] ? false : true
    : never;

// 테스트
type Test1 = IsUnion<string>;        // false 예상
type Test2 = IsUnion<'a' | 'b'>;     // true 예상
type Test3 = IsUnion<boolean>;       // ??? - boolean은 true | false union

// 결과 확인용 변수
const t1: Test1 = false;
const t2: Test2 = true;
const t3: Test3 = true;  // boolean이 union으로 감지되면 true

export {};
