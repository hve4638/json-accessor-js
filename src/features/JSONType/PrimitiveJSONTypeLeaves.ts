import BaseJSONType from './BaseJSONTypeLeaf';

export class NumberJSONTypeLeaf extends BaseJSONType {
    constructor() {
        super('number');
    }

    default_value(value: number) {
        this.value.default_value = value;
        return this;
    }
}

export class StringJSONTypeLeaf extends BaseJSONType {
    constructor() {
        super('string');
    }

    default_value(value: string) {
        this.value.default_value = value;
        return this;
    }
}

export class BooleanJSONTypeLeaf extends BaseJSONType {
    constructor() {
        super('boolean');
        this.value.default_value = false;
    }

    default_value(value: boolean) {
        this.value.default_value = value;
        return this;
    }
}