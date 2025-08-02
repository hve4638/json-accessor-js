import JSONType from '@/features/JSONType';
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

describe('struct: default_value', () => {
    let accessor:MemJSONAccessor;
    
    beforeEach(() => {
        accessor = new MemJSONAccessor({
            any : JSONType.Struct(),
            with_default : {
                key : JSONType.String().default_value('key'),
                value : JSONType.Number().default_value(0),
            },
            without_default : {
                key : JSONType.String().default_value('key'),
                value : JSONType.Number().default_value(0),
                optional : JSONType.Number(),
                optional2 : {
                    item1 : JSONType.String(),
                    item2 : JSONType.String(),
                }
            },
            no : {
                key : JSONType.String(),
                value : JSONType.Number(),
            },
        });
    });

    test('get: with_default', () => {
        expect(accessor.getOne('with_default')).toEqual({ key: 'key', value: 0 });
    });
    
    test('get: without_default', () => {
        expect(accessor.getOne('without_default')).toEqual({ key: 'key', value: 0 });
    });
    
    test('get', () => {
        expect(accessor.getOne('no')).toEqual(undefined);
    });
});