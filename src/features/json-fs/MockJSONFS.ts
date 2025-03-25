import { IJSONFS } from './type';

class MockJSONFS implements IJSONFS {
    async read(filename:string) {
        return {};
    }
    async write(filename:string, contents:Record<string, any>) {

    }
    async rm(filename:string) {
        
    }
    async exists(filename:string) {
        return false;
    }
}

export default MockJSONFS;