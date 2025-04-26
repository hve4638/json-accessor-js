import JSONType from '@/JSONType';
import MemJSONAccessor from '@/MemJSONAccessor';

describe('struct access', () => {
    let accessor:MemJSONAccessor;
    
    beforeEach(() => {
        accessor = new MemJSONAccessor({
            any : JSONType.Struct(),
            structed : JSONType.Struct({
                value : JSONType.Any(),
            }),
        });
    });

    test('set - any', () => {
        accessor.set([['any', { value : 1 }]]);

        expect(accessor.getOne('any')).toEqual({ value : 1 });
    });

    test('set - object', () => {
        accessor.set({
            any : { value : 1 }
        });

        expect(accessor.getOne('any')).toEqual({ value : 1 });
    });
});