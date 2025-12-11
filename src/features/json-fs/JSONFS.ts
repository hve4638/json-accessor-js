import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { IJSONFS } from './type';

class JSONFS implements IJSONFS {
    #writeLock: Promise<void> = Promise.resolve();

    async read(filename: string): Promise<Record<string, any>> {
        if (!existsSync(filename)) {
            return {};
        }

        const jsonText = await fs.readFile(filename, 'utf8');
        if (jsonText.trim() === '') {
            throw new Error(`JSON file is empty: "${filename}"`);
        }

        try {
            return JSON.parse(jsonText);
        }
        catch (error) {
            throw new Error(
                `Failed to parse JSON from "${filename}": ` +
                `${error instanceof Error ? error.message : String(error)}. ` +
                `Content preview: "${jsonText.substring(0, 100)}..."`
            );
        }
    }

    async write(filename: string, contents: Record<string, any>): Promise<void> {
        // Serialize writes using a lock chain
        const previousLock = this.#writeLock;
        let releaseLock: () => void;

        this.#writeLock = new Promise<void>((resolve) => {
            releaseLock = resolve;
        });

        try {
            // Wait for previous write to complete
            await previousLock;

            // Perform atomic write
            await this.#atomicWrite(filename, contents);
        }
        finally {
            releaseLock!();
        }
    }

    async #atomicWrite(filename: string, contents: Record<string, any>): Promise<void> {
        const jsonString = JSON.stringify(contents, null, 4);
        const dir = path.dirname(filename);

        // Generate unique temp file name
        const tempFile = `${filename}.tmp.${Date.now()}.${Math.random().toString(36).substring(2)}`;

        try {
            // Ensure parent directory exists (create if needed)
            await fs.mkdir(dir, { recursive: true });

            // Write to temp file
            await fs.writeFile(tempFile, jsonString, 'utf8');

            // Atomic rename (this is atomic on POSIX systems)
            await fs.rename(tempFile, filename);
        }
        catch (error) {
            // Clean up temp file on failure
            try {
                if (existsSync(tempFile)) {
                    await fs.rm(tempFile);
                }
            } catch {
                // Ignore cleanup errors
            }
            throw error;
        }
    }

    async rm(filename: string): Promise<void> {
        try {
            await fs.rm(filename);
        }
        catch {
            // Ignore errors (file might not exist)
        }
    }

    async exists(filename: string): Promise<boolean> {
        if (!existsSync(filename)) return false;

        return (await fs.stat(filename)).isFile();
    }
}

export default JSONFS;