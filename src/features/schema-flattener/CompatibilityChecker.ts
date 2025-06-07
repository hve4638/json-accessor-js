import { JSONTypeData } from '@/JSONType';
import { IncompatibleTypeError, JSONAccessorError, UnserializableTypeError } from '@/errors';
import { getJSONTypeName } from './utils';
import { ArrayJSONTypeData, StructJSONTypeData, UnionJSONTypeData } from '@/JSONType/types';
import { Flattener } from './Flattener';
import TreeNavigate from 'tree-navigate';
import { ICompatibilityChecker } from './types';

class CompatibilityChecker implements ICompatibilityChecker {
    constructor() {

    }

    check(key: string, value: unknown, typeData: JSONTypeData) {
        if (!this.isCompatible(value, typeData)) {
            const typeName = getJSONTypeName(value);
            if (typeName == null) {
                throw new UnserializableTypeError(key, value);
            }
            else if (typeName === 'null') {
                throw new IncompatibleTypeError(`Incompatible type for field '${key}': expected '${typeData.type}' and not nullable, received null`);
            }
            else if (typeName === 'array' && typeData.type === 'array') {
                throw new IncompatibleTypeError(`Incompatible array structure for field '${key}'`);
            }
            else if (typeData.type === 'union') {
                const expected = this.getUnionTypeNames(typeData as UnionJSONTypeData);
                
                throw new IncompatibleTypeError(`Incompatible type for field '${key}': expected one of (${expected.join(' | ')}), received ${value} ('${typeName}')`);
            }
            else {
                throw new IncompatibleTypeError(`Incompatible type for field '${key}': expected '${typeData.type}', received '${typeName}'`);
            }
        }
    }

    private isCompatible(target: unknown, jsonTypeData: JSONTypeData|string|number|boolean): boolean {
        if (typeof jsonTypeData !== 'object') {
            return target === jsonTypeData;
        }
        else {
            const targetType = getJSONTypeName(target);

            if (targetType === null) {
                return false;
            }
            else if (jsonTypeData.type === 'any') {
                return true;
            }
            else if (targetType === 'null') {
                return jsonTypeData.nullable;
            }
            else if (jsonTypeData.type === 'union') {
                for (const candidate of jsonTypeData.candidates) {
                    if (this.isCompatible(target, candidate)) {
                        return true;
                    }
                }
                return false;
            }
            else if (targetType === jsonTypeData.type) {
                switch (jsonTypeData.type) {
                    case 'array':
                        return this.isArrayCompatible(target as unknown[], jsonTypeData);
                    case 'struct':
                        return this.isStructCompatible(target as object, jsonTypeData);
                    default:
                        return true;
                }
            }
            else {
                return false;
            }
        }
    }

    private isArrayCompatible(array:unknown[], arrayTypeData: ArrayJSONTypeData):boolean {
        if (!arrayTypeData.strict) return true;
        if (!arrayTypeData.element) return true;
        
        for (const ele of array) {
            if (!this.isCompatible(ele, arrayTypeData.element)) {
                return false;
            }
        }
        return true;
    }

    private isStructCompatible(struct:object, structTypeData: StructJSONTypeData):boolean {
        if (!structTypeData.strict) return true;
        if (!structTypeData.struct) return true;

        const navigate = TreeNavigate.from(structTypeData.struct);
        const flattener = new Flattener(navigate, this);
        try {
            flattener.flat({ target : struct, prefix : '' });
            return true;
        }   
        catch (e) {
            return false;
        }
    }

    private getUnionTypeNames(union: UnionJSONTypeData): string[] {
        return union.candidates.map((c)=>{
            if (typeof c === 'object') {
                return c.type;
            }
            else {
                return c.toString();
            }
        });
    }
}

export default CompatibilityChecker;