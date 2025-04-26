import JSONType from '@/JSONType';
import MemJSONAccessor from '@/MemJSONAccessor';

describe('array access', () => {
    let accessor:MemJSONAccessor;
    
    beforeEach(() => {
        accessor = new MemJSONAccessor({
            any_array : JSONType.Array(),
            struct_array : JSONType.Array({
                key : JSONType.Number(),
                value : JSONType.String(),
            }).strict(),
            number_array : JSONType.Array(JSONType.Number()).strict(),
            bool_array : JSONType.Array(JSONType.Bool()).strict(),
            string_array : JSONType.Array(JSONType.String()).strict(),
        });
    });

    const accessTable:{ input:any, output:any, key:string }[] = [
        {
            input : [['struct_array', []]],
            output : [],
            key : 'struct_array',
        },
        {
            input : { 'struct_array' : []},
            output : [],
            key : 'struct_array',
        },
        {
            input : [['struct_array', [{ key : 1, value : 'a' }, { key : 2, value : 'b' }]]],
            output : [{ key : 1, value : 'a', }, { key : 2, value : 'b', }],
            key : 'struct_array',
        },
        {
            input : { 'struct_array' : [{ key : 1, value : 'a' }, { key : 2, value : 'b' }] },
            output : [{ key : 1, value : 'a', }, { key : 2, value : 'b', }],
            key : 'struct_array',
        },
        {
            input : [['number_array', [1, 2, 3, 4, 5]]],
            output : [1, 2, 3, 4, 5],
            key : 'number_array',
        },
        {
            input : { 'number_array' : [1, 2, 3, 4, 5] },
            output : [1, 2, 3, 4, 5],
            key : 'number_array',
        },
        {
            input : [['string_array', ['a', 'b', 'c']]],
            output : ['a', 'b', 'c'],
            key : 'string_array',
        },
        {
            input : { 'string_array' : ['a', 'b', 'c'] },
            output : ['a', 'b', 'c'],
            key : 'string_array',
        },
    ];

    // 잘못된 입력 테스트
    const invalidTable: any[] = [
        { 'struct_array' : [{ key : 'no' }] },
        { 'struct_array' : [{ value : 10 }] },
        { 'number_array' : [1,2,3,'4',5] },
        { 'string_array' : ['10', 1] },
    ]

    accessTable.forEach(({ input, output, key }, index) => {
        test(`access table - ${index}`, () => {
            accessor.set(input);

            expect(accessor.getOne(key)).toEqual(output);
        });
    });

    invalidTable.forEach((input, index) => {
        test(`invalid table - ${index}`, () => {
            expect(() => accessor.set(input)).toThrow();
        });
    });
});
