import { JSONTypeData } from '@/features/JSONType';

// ICompatibilityChecker의 구현은 Flattener를 다시 생성하므로 상호 참조가 발생
// 이를 회피하기 위한 인터페이스
export interface ICompatibilityChecker {
    check(key: string, value: unknown, typeData: JSONTypeData): void;
}

