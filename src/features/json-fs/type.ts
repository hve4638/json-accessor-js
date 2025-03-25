export interface IJSONFS {
    read(filename:string):Promise<Record<any, any>>
    write(filename:string, contents:Record<string, any>):Promise<any>
    rm(filename:string):Promise<void>;
    exists(filename:string):Promise<boolean>;
}