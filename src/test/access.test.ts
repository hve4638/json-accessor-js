import JSONType from '@/features/JSONType';
import MemJSONAccessor from '@/MemJSONAccessor';

describe('JSONAccessor : key type', () => {
    let accessor:MemJSONAccessor;

    type TC_KEY = {
        key:string,
        allowedValues:any[],
        deniedValues:any[],
    }
    
    const testcases:TC_KEY[] = [
        {
            key : 'string',
            allowedValues : ['hello'],
            deniedValues : [0, true, [], {}],
        },
        {
            key : 'number',
            allowedValues : [0],
            deniedValues : ['hello', true, [], {}],
        },
        {
            key : 'boolean',
            allowedValues : [true],
            deniedValues : ['hello', 0, [], {}],
        },
        {
            key : 'array',
            allowedValues : [[], [1,2,3,], ['a', 0, '_', null]],
            deniedValues : ['hello', 0, true, {}],
        },
        {
            key : 'object',
            allowedValues : [{}, { text : 'hello' }],
            deniedValues : ['hello', 0, true, []],
        }
    ]
    beforeEach(() => {
        accessor = new MemJSONAccessor({
            string : JSONType.String(),
            number : JSONType.Number(),
            boolean : JSONType.Bool(),
            array : JSONType.Array(),
            object : JSONType.Struct(),
        });
    });

    testcases.forEach((testcase) => {
        testcase.allowedValues.forEach((allowed) => {
            test(`> setOne ${testcase.key}-${allowed} (allowed)`, () => {
                accessor.setOne(testcase.key, allowed);
                expect(accessor.getOne(testcase.key)).toBe(allowed);
            });
        });
        testcase.deniedValues.forEach((denied) => {
            test(`> setOne ${testcase.key}-${JSON.stringify(denied)} (denied)`, () => {
                expect(() => accessor.setOne(testcase.key, denied)).toThrow(); 
            });
        });
    });
});

describe('JSONAccessor : union type', () => {
    let accessor:MemJSONAccessor;

    type TC_KEY = {
        key:string,
        allowedValues:any[],
        deniedValues:any[],
    }
    
    const testcases:TC_KEY[] = [
        {
            key : 'multitype',
            allowedValues : [0, 1, 2, '1', '2', '3', true, false],
            deniedValues : [[], {}],
        },
        {
            key : 'number',
            allowedValues : [1, 2, 3],
            deniedValues : [4, 5, '1', '2', '3', true, false, [], {}],
        },
        {
            key : 'string',
            allowedValues : ['1', '2', '3'],
            deniedValues : [1, 2, 3, '4', '5', true, false, [], {}],
        },
    ]
    beforeEach(() => {
        accessor = new MemJSONAccessor({
            multitype : JSONType.Union(JSONType.Number(), JSONType.String(), JSONType.Bool()),
            number : JSONType.Union(1, 2, 3),
            string : JSONType.Union('1', '2', '3'),
        });
    });

    testcases.forEach((testcase) => {
        testcase.allowedValues.forEach((allowed) => {
            test(`> setOne ${testcase.key}-${allowed} (allowed)`, () => {
                accessor.setOne(testcase.key, allowed);
                expect(accessor.getOne(testcase.key)).toBe(allowed);
            });
        });
        testcase.deniedValues.forEach((denied) => {
            test(`> setOne ${testcase.key}-${JSON.stringify(denied)} (denied)`, () => {
                expect(() => accessor.setOne(testcase.key, denied)).toThrow(); 
            });
        });
    });
});

describe('JSONAccessor : multiple R/W', () => {
    let accessor:MemJSONAccessor;
    
    beforeEach(() => {
        accessor = new MemJSONAccessor({
            box1 : {
                name : JSONType.String(),
                id : JSONType.String(),
                no : JSONType.Number(),
                addition : {
                    x : JSONType.Number(),
                    y : JSONType.Number(),
                }
            },
            box2 : {
                name : JSONType.String(),
                id : JSONType.String(),
                no : JSONType.Number(),
                addition : {
                    x : JSONType.Number(),
                    y : JSONType.Number(),
                }
            }
        });
    });

    test('set with array', () => {
        accessor.set([
            ['box1.name', 'box1'],
            ['box1.id', 'id1'],
            ['box1.no', 1],
            ['box1.addition.x', 10],
            ['box1.addition.y', 20],
        ]);

        const expected = {
            box1 : {
                name : 'box1',
                id : 'id1',
                no : 1,
                addition : {
                    x : 10,
                    y : 20,
                }
            }
        }
        const actual = accessor.get(
            'box1.name',
            'box1.id',
            'box1.no',
            'box1.addition.x',
            'box1.addition.y',
        );
        expect(actual).toEqual(expected);
    });
    
    test('set with object', () => {
        accessor.set({
            'box1' : {
                name : 'box1',
                id : 'id1',
                no : 1,
                addition : {
                    x : 10,
                    y : 20,
                }
            }
        });

        const expected = {
            box1 : {
                name : 'box1',
                id : 'id1',
                no : 1,
                addition : {
                    x : 10,
                    y : 20,
                }
            }
        }
        const actual = accessor.get(
            'box1.name',
            'box1.id',
            'box1.no',
            'box1.addition.x',
            'box1.addition.y',
        );
        expect(actual).toEqual(expected);
    });
});

describe('JSONAccessor : raw access', () => {
    let accessor:MemJSONAccessor;

    const testcases:[string, any, (raw:any)=>any][] = [
        ['box1.name', 'box1', (raw)=>raw.box1.name],
        ['box1.id', 'id1', (raw)=>raw.box1.id],
        ['box1.no', 1, (raw)=>raw.box1.no],
        ['box1.list', [1,2,3,4], (raw)=>raw.box1.list],
        ['box1.addition.x', 10, (raw) => raw.box1.addition.x],
        ['box1.addition.y', 20, (raw) => raw.box1.addition.y],
        ['box2.name', 'box2', (raw) => raw.box2.name],

        ['box2.id', 'id2', (raw) => raw.box2.id],
        ['box2.no', 2, (raw) => raw.box2.no],
        ['box2.addition.x', 30, (raw) => raw.box2.addition.x],
        ['box2.addition.y', 40, (raw) => raw.box2.addition.y],
    ];

    beforeEach(() => {
        accessor = new MemJSONAccessor({
            box1 : {
                name : JSONType.String(),
                id : JSONType.String(),
                no : JSONType.Number(),
                list : JSONType.Array(),
                addition : {
                    x : JSONType.Number(),
                    y : JSONType.Number(),
                }
            },
            box2 : {
                name : JSONType.String(),
                id : JSONType.String(),
                no : JSONType.Number(),
                addition : {
                    x : JSONType.Number(),
                    y : JSONType.Number(),
                }
            },
        });
    });

    testcases.forEach(([key, value, rawAccess]) => {
        test(`setOne ${key}`, () => {
            accessor.setOne(key, value);
            expect(accessor.getOne(key)).toEqual(value);
            expect(rawAccess(accessor.getAll())).toEqual(value);
        });
    });

    test('whole set', () => {
        const expected = {
            box1 : {
                name : 'box1',
                id : 'id1',
                no : 1,
                list : [1,2,3,4],
                addition : {
                    x : 10,
                    y : 20,
                }
            },
            box2 : {
                name : 'box2',
                id : 'id2',
                no : 2,
                addition : {
                    x : 30,
                    y : 40,
                }
            }
        };
        accessor.set(expected);

        expect(accessor.getAll()).toEqual(expected);
    });
});
