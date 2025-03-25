import BaseJSONType from './BaseJSONTypeLeaf';

export class AnyJSONTypeLeaf extends BaseJSONType {
    constructor() { 
        super('any');
    }

    default_value(value:any) {
        this.value.default_value = value;
        return this;
    }
}

export default AnyJSONTypeLeaf;