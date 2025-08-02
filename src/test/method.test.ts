import JSONType from '@/features/JSONType';
import MemJSONAccessor from '@/MemJSONAccessor';

describe('JSONAccessor : method', () => {
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
            array : JSONType.Array(),
            layer1 : {
                array : JSONType.Array(),
            }
        });
    });

    test('exists', () => {
        const accessPath = ['box1','box1.name','box1.id','box1.addition','box1.addition.x'];
        const expectExist = (expected:boolean[]) => {
            const actual = accessor.exists(accessPath);
            expect(actual).toEqual(expected);
        }

        expectExist([false, false, false, false, false]);

        accessor.setOne('box1.name', 'test');
        expectExist([true, true, false, false, false]);
        
        accessor.setOne('box1.addition.x', 0);
        expectExist([true, true, false, true, true]);
        
        accessor.removeOne('box1.addition.x');
        expectExist([true, true, false, true, false]);

        accessor.removeOne('box1.addition');
        expectExist([true, true, false, false, false]);

        accessor.removeOne('box1');
        expectExist([false, false, false, false, false]);
    });

});

describe('JSONAccessor : default_value', () => {
    let accessor:MemJSONAccessor;
    
    beforeEach(() => {
        accessor = new MemJSONAccessor({
            number : JSONType.Number(),
            numberN : JSONType.Number().nullable(),
            numberD : JSONType.Number().default_value(1),
            numberND : JSONType.Number().nullable().default_value(1),
        });
    });

    test('default_value 2', () => {
        expect(accessor.getOne('number')).toEqual(undefined);
        expect(accessor.getOne('numberN')).toEqual(undefined);
        expect(accessor.getOne('numberD')).toEqual(1);
        expect(accessor.getOne('numberND')).toEqual(1);

    });
});