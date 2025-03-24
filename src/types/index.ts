import { JSONTypeLeaf } from '@/JSONType';

export type KeyValueInput = [string, any][] | Record<string, any>;

export type JSONTree = {
    [key:string]:JSONTree|JSONTypeLeaf;
}

export interface IJSONAccessor {
    get jsonStructure():JSONTree|null;
    
    loadData():void;
    hasExistingData():boolean;

    set(items:KeyValueInput):string[];
    setOne(key:string, value:any):void;
    get(...keys:string[]):Record<string,any>;
    getOne(key:string):any;
    getAll():Record<string, any>;
    remove(keys:string[]):void;
    removeOne(key:string):void;
    exists(keys:string[]):boolean[];
    existsOne(key:string):boolean;
    // pushToArray(items:KeyValueInput):string[];
    // pushOneToArray(key:string, value:any):void;
    
    commit():void;
    drop():void;
    get dropped():boolean;
}