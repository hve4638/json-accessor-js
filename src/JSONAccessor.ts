import * as fs from 'node:fs';
import TreeNavigate from 'tree-navigate';

import { IJSONAccessor, JSONTree, KeyValueInput } from '@/types';
import { JSONAccessorError } from '@/errors';
import JSONType, { isJSONTypeData, JSONTypeData, JSONTypeNames } from '@/JSONType';
import ObjectFlatter from '@/features/object-flatter';
import { resolveNestedRef } from './utils';
import { IJSONFS, JSONFS } from '@/features/json-fs';

class JSONAccessor implements IJSONAccessor {
    static anyJSONType = JSONType.Any().nullable().value;
    protected filePath:string;
    protected explorer:TreeNavigate<JSONTypeData>|null = null;
    protected contents:Record<string, any>;
    protected jsonFS:IJSONFS = new JSONFS()
    #flatter:ObjectFlatter;
    #isDropped:boolean = false;
    #changed:boolean = true;
    
    constructor(filePath:string, tree:JSONTree|null=null) {
        this.filePath = filePath;
        this.contents = {};
        if (tree) {
            this.explorer = TreeNavigate.from(tree, { delimiter: '.', allowWildcard: true, allowRecursiveWildcard : false });
            this.#flatter = new ObjectFlatter(this.explorer);
        }
        else {
            this.#flatter = new ObjectFlatter();
        }
    }

    async load() {
        this.contents = await this.jsonFS.read(this.filePath);
    }
    async save(force:boolean=false) {
        this.#ensureNotDropped();
        if (!this.#changed && !force) {
            return;
        }
        this.#changed = false;
        await this.jsonFS.write(this.filePath, this.contents);
    }
    async drop() {
        if (this.dropped) return;

        this.#isDropped = true;
        await this.jsonFS.rm(this.filePath);
    }
    get dropped() {
        return this.#isDropped;
    }
    
    async hasExistingData() {
        return await this.jsonFS.exists(this.filePath);
    }

    setOne(key:string, value:any):void {
        this.#ensureNotDropped();
        
        this.set([[key, value]]);
    }
    set(data: KeyValueInput):string[] {
        this.#ensureNotDropped();
        this.#changed = true;

        let setterList:[string, any][] = [];
        if (Array.isArray(data)) {
            setterList = this.#flatter.transform(data);
        }
        else {
            setterList = this.#flatter.flat(data);
        }

        let names:string[] = [];
        for (const [key, value] of setterList) {
            names.push(key);
            this.#setData(key, value);
        }
        return names;
    }
    getOne(key:string):any {
        this.#ensureNotDropped();
        
        return this.#getData(key);
    }
    get(...keys:string[]):Record<string,any> {
        this.#ensureNotDropped();
        
        const result:Record<string,any> = {};
        for (const key of keys) {
            const value = this.#getData(key);

            const resolved = resolveNestedRef(result, key, true)!;
            resolved.parent[resolved.key] = value;
        }
        
        return result;
    }
    getAll() {
        this.#ensureNotDropped();
        
        return structuredClone(this.contents);
    }
    removeOne(key:string) {
        this.#ensureNotDropped();
        this.#changed = true;

        this.#removeData(key);
    }
    remove(keys:string[]) {
        this.#ensureNotDropped();
        this.#changed = true;

        for (const key of keys) {
            this.#removeData(key);
        }
    }

    existsOne(key:string) {
        this.#ensureNotDropped();
        
        const value = this.#getData(key);
        return value !== undefined;
    }
    exists(keys:string[]) {
        this.#ensureNotDropped();
        
        return keys.map((key) => {
            const value = this.#getData(key);
            return value !== undefined;
        });
    }
    
    #setData(key:string, value:any) {
        const resolved = resolveNestedRef(this.contents, key, true);
        if (resolved) {
            resolved.parent[resolved.key] = value;
        }
    }
    #getData(key:string) {
        const resolved = resolveNestedRef(this.contents, key);
        if (resolved) {
            return resolved.parent[resolved.key];
        }
        else {
            return undefined;
        }
    }
    #removeData(key:string) {
        const resolved = resolveNestedRef(this.contents, key);
        if (resolved) delete resolved.parent[resolved.key];
    }

    #ensureNotDropped() {
        if (this.dropped) {
            throw new JSONAccessorError('This accessor has been dropped');
        }
    }
}

export default JSONAccessor;