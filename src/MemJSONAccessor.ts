import { JSONTree } from '@/types';
import JSONAccessor from '@/JSONAccessor';
import { MockJSONFS } from './features/json-fs';

class MemJSONAccessor extends JSONAccessor {
    override jsonFS = new MockJSONFS();
    constructor(tree:JSONTree|null=null) {
        super('', tree);
    }
}

export default MemJSONAccessor;