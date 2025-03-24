import * as fs from 'node:fs';
import TreeNavigate from 'tree-navigate';

import { IJSONAccessor, JSONTree, KeyValueInput } from '@/types';
import { JSONAccessorError } from '@/errors';
import JSONType, { isJSONTypeData, JSONTypeData, JSONTypeNames } from './JSONType';
import ObjectFlatter from './features/object-flatter';

class JSONAccessor implements IJSONAccessor {
    static anyJSONType = JSONType.Any().nullable().value;
    protected filePath:string;
    protected explorer:TreeNavigate<JSONTypeData>|null = null;
    protected contents:Record<string, any>;
    #tree:JSONTree|null = null;
    #flatter:ObjectFlatter;
    #isDropped:boolean = false;
    
    constructor(filePath:string, tree:JSONTree|null=null) {
        this.filePath = filePath;
        this.contents = {};
        if (tree) {
            this.#tree = tree;
            this.explorer = TreeNavigate.from(tree, { delimiter: '.', allowWildcard: true, allowRecursiveWildcard : false });
            this.#flatter = new ObjectFlatter(this.explorer);
        }
        else {
            this.#flatter = new ObjectFlatter();
        }
    }

    loadData() {
        this.readFile();
    }
    
    hasExistingData() {
        return this.existsFile();
    }
    
    protected readFile() {
        if (fs.existsSync(this.filePath)) {
            const contents = fs.readFileSync(this.filePath, 'utf8');
            try {
                this.contents = JSON.parse(contents);
            }
            catch {
                this.contents = {};
            }
        }
        else {
            this.contents = {};
        }
    }
    protected writeFile() {
        const jsonString = JSON.stringify(this.contents, null, 4);

        fs.writeFileSync(this.filePath, jsonString, 'utf8');
    }
    protected removeFile() {
        try {
            fs.rmSync(this.filePath, { force: true });
        } catch (error) {
            console.warn(`Failed to remove file ${this.filePath}:`, error);
        }
    }
    protected existsFile() {
        if (!fs.existsSync(this.filePath)) return false;

        return fs.statSync(this.filePath).isFile();
    }

    get jsonStructure() {
        return this.#tree;
    }

    setOne(key:string, value:any):void {
        this.#ensureNotDropped();
        
        this.set([[key, value]]);
    }
    set(data: KeyValueInput):string[] {
        this.#ensureNotDropped();

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

            const resolved = this.#resolveContentsPath(result, key, true)!;
            resolved.ref[resolved.key] = value;
        }
        
        return result;
    }
    getAll() {
        this.#ensureNotDropped();
        
        return structuredClone(this.contents);
    }
    removeOne(key:string) {
        this.#ensureNotDropped();

        this.#removeData(key);
    }
    remove(keys:string[]) {
        this.#ensureNotDropped();

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
    
    commit() {
        this.#ensureNotDropped();

        this.writeFile();
    }
    drop() {
        if (this.dropped) return;

        this.removeFile();
        this.#isDropped = true;
    }
    get dropped() {
        return this.#isDropped;
    }


    #setData(key:string, value:any) {
        const resolved = this.#resolveContentsPath(this.contents, key, true);
        if (resolved) {
            resolved.ref[resolved.key] = value;
        }
    }
    #getData(key:string) {
        const resolved = this.#resolveContentsPath(this.contents, key);
        if (resolved) {
            return resolved.ref[resolved.key];
        }
        else {
            return undefined;
        }
    }
    #removeData(key:string) {
        const resolved = this.#resolveContentsPath(this.contents, key);
        if (resolved) delete resolved.ref[resolved.key];
    }

    /**
     * 중첩된 객체의 경로를 찾아, 마지막 객체와 키를 반환
     * 
     * @param contents 객체
     * @param target "."로 구분되는 경로 문자열. 예) "layer1.layer2.item"
     * @param createIfMissing 경로 중간에 객체가 없을 경우, 생성할지 여부. false인 경우 undefined 반환
     * @returns 
     */
    #resolveContentsPath(contents:Record<string,any>, target:string, createIfMissing:boolean=false):{ ref:Record<string,any>, key:string }|undefined {
        const keys = target.split('.');

        let ref:any = contents;

        const size = keys.length-1;
        for (let i=0; i<size; i++) {
            const key = keys[i];
            if (!(key in ref)) {
                if (!createIfMissing) return undefined;

                ref[key] = {};
            }
            ref = ref[key];
        }
        return {
            ref,
            key : keys[size],
        }
    }

    #ensureNotDropped() {
        if (this.dropped) {
            throw new JSONAccessorError('This accessor has been dropped');
        }
    }
}

export default JSONAccessor;