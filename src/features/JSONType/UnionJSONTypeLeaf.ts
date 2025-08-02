import BaseJSONType from './BaseJSONTypeLeaf';

export class UnionJSONTypeLeaf extends BaseJSONType {
    constructor(...candidates:(string|number|boolean|null|undefined|BaseJSONType)[]) { 
        super('union');
        this.value['candidates'] = candidates.map((candidate) => {
            if (candidate instanceof BaseJSONType) {
                return candidate.value;
            }
            else {
                return candidate;
            }
        });
    }

    default_value(value:any) {
        this.value.default_value = value;
        return this;
    }
}

export default UnionJSONTypeLeaf;