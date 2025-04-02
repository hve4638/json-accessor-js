import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import { IJSONFS } from './type';

class JSONFS implements IJSONFS {
    async read(filename:string) {
        let contents:Record<string, any>;
        if (existsSync(filename)) {
            const jsonText = await fs.readFile(filename, 'utf8');
            try {
                contents = JSON.parse(jsonText);
            }
            catch {
                contents = {};
            }
        }
        else {
            contents = {};
        }
        return contents;
    }
    async write(filename:string, contents:Record<string, any>) {
        const jsonString = JSON.stringify(contents, null, 4);

        await fs.writeFile(filename, jsonString, 'utf8');
    }
    async rm(filename:string) {
        try {
            await fs.rm(filename);
        } catch (error) {
            
        }
    }
    async exists(filename:string) {
        if (!existsSync(filename)) return false;

        return (await fs.stat(filename)).isFile();
    }
}

export default JSONFS;