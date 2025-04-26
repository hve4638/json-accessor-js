import { JSONTypeData } from "@/JSONType";


export interface ICompatibilityChecker {
    check(key: string, value: unknown, typeData: JSONTypeData): void;
}

