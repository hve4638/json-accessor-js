import { IncompatibleTypeError } from '@/errors';
import JSONType from '@/JSONType';
import MemJSONAccessor from '@/MemJSONAccessor';

describe('JSONAccessor : key type', () => {
    let accessor:MemJSONAccessor;

    beforeEach(() => {
        accessor = new MemJSONAccessor({
            string : JSONType.String(),
            number : JSONType.Number(),
            boolean : JSONType.Bool(),
            array : JSONType.Array(),
            object : JSONType.Struct(),
            any : JSONType.Any(),
        });
    });

    test('set null', () => {
        accessor.setOne('any', null);
        expect(()=>accessor.setOne('string', null)).toThrow(IncompatibleTypeError);
        expect(()=>accessor.setOne('number', null)).toThrow(IncompatibleTypeError);
        expect(()=>accessor.setOne('boolean', null)).toThrow(IncompatibleTypeError);
        expect(()=>accessor.setOne('array', null)).toThrow(IncompatibleTypeError);
        expect(()=>accessor.setOne('object', null)).toThrow(IncompatibleTypeError);
    });

    test('set undefined', () => {
        accessor.setOne('any', undefined);
        expect(()=>accessor.setOne('string', undefined)).toThrow(IncompatibleTypeError);
        expect(()=>accessor.setOne('number', undefined)).toThrow(IncompatibleTypeError);
        expect(()=>accessor.setOne('boolean', undefined)).toThrow(IncompatibleTypeError);
        expect(()=>accessor.setOne('array', undefined)).toThrow(IncompatibleTypeError);
        expect(()=>accessor.setOne('object', undefined)).toThrow(IncompatibleTypeError);
    });
});
