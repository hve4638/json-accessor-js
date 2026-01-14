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

describe('JSONAccessor : replaceOne', () => {
    let accessor:MemJSONAccessor;

    beforeEach(() => {
        accessor = new MemJSONAccessor({
            data : JSONType.Struct(),
            nested : {
                item : JSONType.Struct(),
            }
        });
    });

    test('replaceOne removes existing properties and sets new value', () => {
        // 초기 데이터 설정
        accessor.setOne('data', { a: 1, b: 2, c: 3 });
        expect(accessor.getOne('data')).toEqual({ a: 1, b: 2, c: 3 });

        // replaceOne으로 교체 - 기존 a, b, c가 삭제되어야 함
        accessor.replaceOne('data', { x: 10 });
        expect(accessor.getOne('data')).toEqual({ x: 10 });
    });

    test('setOne on Struct type replaces entire object', () => {
        // Struct 타입에서는 setOne이 전체 객체를 대체함
        accessor.setOne('data', { a: 1, b: 2, c: 3 });
        accessor.setOne('data', { x: 10 });
        expect(accessor.getOne('data')).toEqual({ x: 10 });
    });

    test('replaceOne on nested path', () => {
        accessor.setOne('nested.item', { old: 'value', keep: false });
        expect(accessor.getOne('nested.item')).toEqual({ old: 'value', keep: false });

        accessor.replaceOne('nested.item', { new: 'data' });
        expect(accessor.getOne('nested.item')).toEqual({ new: 'data' });
    });

    test('replaceOne on non-existing key', () => {
        accessor.replaceOne('data', { fresh: true });
        expect(accessor.getOne('data')).toEqual({ fresh: true });
    });
});

describe('JSONAccessor : set merge behavior with schema', () => {
    let accessor:MemJSONAccessor;

    beforeEach(() => {
        accessor = new MemJSONAccessor({
            config : {
                name : JSONType.String(),
                value : JSONType.Number(),
                extra : JSONType.String(),
            }
        });
    });

    test('set with object merges on schema-defined nested structure', () => {
        // 스키마가 정의된 중첩 구조에서 set 동작 확인
        accessor.set({ config: { name: 'test', value: 1, extra: 'old' } });
        expect(accessor.getOne('config')).toEqual({ name: 'test', value: 1, extra: 'old' });

        // 일부 속성만 업데이트 - 머지 동작 발생
        accessor.set({ config: { name: 'updated' } });
        const result = accessor.getOne('config');

        // 기존 value, extra가 남아있음 (머지 동작)
        expect(result).toEqual({ name: 'updated', value: 1, extra: 'old' });
    });

    test('replaceOne clears all properties on schema-defined structure', () => {
        accessor.set({ config: { name: 'test', value: 1, extra: 'old' } });

        // replaceOne으로 교체 - 기존 속성 삭제됨
        accessor.replaceOne('config', { name: 'new' });
        const result = accessor.getOne('config');

        expect(result).toEqual({ name: 'new' });
    });
});

describe('JSONAccessor : Struct with JSONTree', () => {
    let accessor:MemJSONAccessor;

    beforeEach(() => {
        accessor = new MemJSONAccessor({
            // Struct 타입에 내부 JSONTree 정의
            data: JSONType.Struct({
                name: JSONType.String(),
                value: JSONType.Number(),
                extra: JSONType.String(),
            }),
        });
    });

    test('setOne on Struct(tree) - stores entire object (no merge)', () => {
        // setOne은 transform() 사용 → 전체 객체 저장
        accessor.setOne('data', { name: 'test', value: 1, extra: 'old' });
        accessor.setOne('data', { name: 'updated' });

        // 전체 대체? 또는 머지?
        const result = accessor.getOne('data');
        console.log('setOne result:', result);
        expect(result).toEqual({ name: 'updated' });
    });

    test('set on Struct(tree) - flattens and merges', () => {
        // set은 flat() 사용 → 평탄화
        accessor.set({ data: { name: 'test', value: 1, extra: 'old' } });
        accessor.set({ data: { name: 'updated' } });

        // 머지 동작 예상
        const result = accessor.getOne('data');
        console.log('set result:', result);
        expect(result).toEqual({ name: 'updated', value: 1, extra: 'old' });
    });

    test('replaceOne on Struct(tree) - clears and sets', () => {
        accessor.set({ data: { name: 'test', value: 1, extra: 'old' } });
        accessor.replaceOne('data', { name: 'new' });

        const result = accessor.getOne('data');
        expect(result).toEqual({ name: 'new' });
    });
});

describe('JSONAccessor : Struct set vs setOne', () => {
    test('Struct() - setOne vs set', () => {
        const accessor = new MemJSONAccessor({
            data: JSONType.Struct()
        });

        // setOne
        accessor.setOne('data', { a: 1, b: 2 });
        accessor.setOne('data', { x: 10 });
        console.log('Struct() setOne:', accessor.getOne('data'));

        // reset
        accessor.removeOne('data');

        // set
        accessor.set({ data: { a: 1, b: 2 } });
        accessor.set({ data: { x: 10 } });
        console.log('Struct() set:', accessor.getOne('data'));
    });

    test('Struct(tree) - setOne vs set', () => {
        const accessor = new MemJSONAccessor({
            data: JSONType.Struct({
                a: JSONType.Number(),
                b: JSONType.Number(),
                x: JSONType.Number(),
            })
        });

        // setOne
        accessor.setOne('data', { a: 1, b: 2 });
        accessor.setOne('data', { x: 10 });
        console.log('Struct(tree) setOne:', accessor.getOne('data'));

        // reset
        accessor.removeOne('data');

        // set
        accessor.set({ data: { a: 1, b: 2 } });
        accessor.set({ data: { x: 10 } });
        console.log('Struct(tree) set:', accessor.getOne('data'));
    });
});

describe('JSONAccessor : setOne consistency check', () => {
    test('setOne on plain object schema - check behavior', () => {
        // 일반 객체로 정의
        const accessor = new MemJSONAccessor({
            config: {
                name: JSONType.String(),
                value: JSONType.Number(),
                extra: JSONType.String(),
            }
        });

        accessor.setOne('config', { name: 'test', value: 1, extra: 'old' });
        accessor.setOne('config', { name: 'updated' });

        const result = accessor.getOne('config');
        console.log('plain object schema - setOne result:', result);
    });

    test('setOne on Struct() schema - check behavior', () => {
        // JSONType.Struct()로 정의 (인자 없음)
        const accessor = new MemJSONAccessor({
            config: JSONType.Struct()
        });

        accessor.setOne('config', { name: 'test', value: 1, extra: 'old' });
        accessor.setOne('config', { name: 'updated' });

        const result = accessor.getOne('config');
        console.log('Struct() schema - setOne result:', result);
    });

    test('setOne on Struct(tree) schema - check behavior', () => {
        // JSONType.Struct(tree)로 정의 (인자 있음)
        const accessor = new MemJSONAccessor({
            config: JSONType.Struct({
                name: JSONType.String(),
                value: JSONType.Number(),
                extra: JSONType.String(),
            })
        });

        accessor.setOne('config', { name: 'test', value: 1, extra: 'old' });
        accessor.setOne('config', { name: 'updated' });

        const result = accessor.getOne('config');
        console.log('Struct(tree) schema - setOne result:', result);
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