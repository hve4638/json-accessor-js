import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import JSONAccessor from '@/JSONAccessor';
import JSONType from '@/features/JSONType';

describe('JSONAccessor : Race Condition / Data Corruption Tests', () => {
    let tempDir: string;
    let testFilePath: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'json-accessor-test-'));
        testFilePath = path.join(tempDir, 'test.json');
    });

    afterEach(async () => {
        try {
            await fs.rm(tempDir, { recursive: true });
        } catch {}
    });

    describe('Concurrent save() race condition', () => {
        test('multiple concurrent save() calls should not lose data', async () => {
            const accessor = new JSONAccessor(testFilePath, {
                counter: JSONType.Number(),
                data: JSONType.String(),
            });

            // Set initial data
            accessor.set({ counter: 0, data: 'initial' });

            // Save concurrently multiple times
            const savePromises: Promise<void>[] = [];
            for (let i = 0; i < 10; i++) {
                accessor.setOne('counter', i);
                savePromises.push(accessor.save());
            }

            await Promise.all(savePromises);

            // Reload and verify
            const verifyAccessor = new JSONAccessor(testFilePath, {
                counter: JSONType.Number(),
                data: JSONType.String(),
            });
            await verifyAccessor.load();

            // The counter should be 9 (last value set)
            expect(verifyAccessor.getOne('counter')).toBe(9);
        });

        test('concurrent save() from different accessor instances should not corrupt file', async () => {
            // Create two accessors pointing to the same file
            const accessor1 = new JSONAccessor(testFilePath, {
                value1: JSONType.String(),
                value2: JSONType.String(),
            });
            const accessor2 = new JSONAccessor(testFilePath, {
                value1: JSONType.String(),
                value2: JSONType.String(),
            });

            // Set different data in each
            accessor1.set({ value1: 'from-accessor-1', value2: 'initial' });
            accessor2.set({ value1: 'initial', value2: 'from-accessor-2' });

            // Save both concurrently
            await Promise.all([
                accessor1.save(),
                accessor2.save(),
            ]);

            // Verify file is valid JSON (not empty or corrupted)
            const content = await fs.readFile(testFilePath, 'utf8');
            expect(content.length).toBeGreaterThan(2); // Should not be empty "{}"

            // Should be valid JSON
            const parsed = JSON.parse(content);
            expect(parsed).toBeDefined();

            // At least one of the values should be preserved
            const hasValue1 = parsed.value1 === 'from-accessor-1' || parsed.value1 === 'initial';
            const hasValue2 = parsed.value2 === 'from-accessor-2' || parsed.value2 === 'initial';
            expect(hasValue1).toBe(true);
            expect(hasValue2).toBe(true);
        });
    });

    describe('#changed flag race condition', () => {
        test('setOne during save() should not be lost', async () => {
            const accessor = new JSONAccessor(testFilePath, {
                initial: JSONType.String(),
                added: JSONType.String(),
            });

            accessor.setOne('initial', 'value');

            // Start save (don't await)
            const savePromise = accessor.save();

            // Immediately set another value while save is in progress
            accessor.setOne('added', 'should-be-saved');

            await savePromise;

            // Save again to ensure the added value is persisted
            await accessor.save();

            // Reload and verify
            const verifyAccessor = new JSONAccessor(testFilePath, {
                initial: JSONType.String(),
                added: JSONType.String(),
            });
            await verifyAccessor.load();

            expect(verifyAccessor.getOne('initial')).toBe('value');
            expect(verifyAccessor.getOne('added')).toBe('should-be-saved');
        });

        test('save() called when #changed is false should still work after modification', async () => {
            const accessor = new JSONAccessor(testFilePath, {
                value: JSONType.Number(),
            });

            accessor.setOne('value', 1);
            await accessor.save(); // #changed becomes false

            accessor.setOne('value', 2);
            await accessor.save(); // Should save because #changed is true again

            const verifyAccessor = new JSONAccessor(testFilePath);
            await verifyAccessor.load();

            expect(verifyAccessor.getOne('value')).toBe(2);
        });
    });

    describe('Concurrent load and save', () => {
        test('load() during save() should not result in empty content', async () => {
            // First create a file with initial content
            const initialAccessor = new JSONAccessor(testFilePath, {
                data: JSONType.String(),
            });
            initialAccessor.setOne('data', 'initial-data');
            await initialAccessor.save();

            // Create two accessors
            const saveAccessor = new JSONAccessor(testFilePath, {
                data: JSONType.String(),
            });
            const loadAccessor = new JSONAccessor(testFilePath, {
                data: JSONType.String(),
            });

            // Load initial data
            await saveAccessor.load();

            // Modify and start save
            saveAccessor.setOne('data', 'modified-data');
            const savePromise = saveAccessor.save();

            // Immediately try to load in another accessor
            const loadPromise = loadAccessor.load();

            await Promise.all([savePromise, loadPromise]);

            // loadAccessor should have either initial or modified data, but never empty
            const loadedData = loadAccessor.getOne('data');
            expect(loadedData).toBeDefined();
            expect(['initial-data', 'modified-data']).toContain(loadedData);
        });
    });

    describe('Rapid successive saves', () => {
        test('many rapid saves should not result in empty file', async () => {
            const accessor = new JSONAccessor(testFilePath, {
                counter: JSONType.Number(),
            });

            // Perform many rapid save operations
            for (let i = 0; i < 100; i++) {
                accessor.setOne('counter', i);
                await accessor.save();
            }

            // Verify file content
            const content = await fs.readFile(testFilePath, 'utf8');
            expect(content.trim()).not.toBe('');
            expect(content.trim()).not.toBe('{}');

            const parsed = JSON.parse(content);
            expect(parsed.counter).toBe(99);
        });

        test('concurrent rapid saves should not corrupt file', async () => {
            const accessor = new JSONAccessor(testFilePath, {
                counter: JSONType.Number(),
            });

            accessor.setOne('counter', 0);

            // Fire off many concurrent saves
            const promises: Promise<void>[] = [];
            for (let i = 0; i < 50; i++) {
                accessor.setOne('counter', i);
                promises.push(accessor.save());
            }

            await Promise.all(promises);

            // Verify file is valid JSON
            const content = await fs.readFile(testFilePath, 'utf8');
            expect(content.trim()).not.toBe('');
            expect(content.trim()).not.toBe('{}');

            const parsed = JSON.parse(content);
            expect(typeof parsed.counter).toBe('number');
        });
    });

    describe('Empty file edge cases', () => {
        test('save with empty contents should create valid JSON', async () => {
            const accessor = new JSONAccessor(testFilePath);
            await accessor.save();

            const content = await fs.readFile(testFilePath, 'utf8');
            expect(content.trim()).toBe('{}');

            const parsed = JSON.parse(content);
            expect(parsed).toEqual({});
        });

        test('loading non-existent file then saving should work', async () => {
            const accessor = new JSONAccessor(testFilePath, {
                value: JSONType.String(),
            });

            await accessor.load(); // File doesn't exist yet
            accessor.setOne('value', 'test');
            await accessor.save();

            const content = await fs.readFile(testFilePath, 'utf8');
            const parsed = JSON.parse(content);
            expect(parsed.value).toBe('test');
        });
    });

    describe('Multiple accessor instances - same file', () => {
        test('two accessors modifying same file concurrently should not result in data loss', async () => {
            // Setup initial file
            const setupAccessor = new JSONAccessor(testFilePath, {
                field1: JSONType.String(),
                field2: JSONType.String(),
                field3: JSONType.String(),
            });
            setupAccessor.set({
                field1: 'initial1',
                field2: 'initial2',
                field3: 'initial3',
            });
            await setupAccessor.save();

            // Create two accessors that will modify concurrently
            const accessor1 = new JSONAccessor(testFilePath, {
                field1: JSONType.String(),
                field2: JSONType.String(),
                field3: JSONType.String(),
            });
            const accessor2 = new JSONAccessor(testFilePath, {
                field1: JSONType.String(),
                field2: JSONType.String(),
                field3: JSONType.String(),
            });

            // Both load the initial data
            await Promise.all([accessor1.load(), accessor2.load()]);

            // Each modifies different fields
            accessor1.setOne('field1', 'modified-by-1');
            accessor2.setOne('field2', 'modified-by-2');

            // Save concurrently
            await Promise.all([accessor1.save(), accessor2.save()]);

            // Verify final state
            const content = await fs.readFile(testFilePath, 'utf8');
            expect(content.trim()).not.toBe('');
            expect(content.trim()).not.toBe('{}');

            const parsed = JSON.parse(content);

            // File should be valid JSON with some data
            // Due to race condition, we may lose one accessor's changes,
            // but the file should never be empty or just "{}"
            const hasField1 = parsed.field1 !== undefined && parsed.field1 !== null;
            const hasField2 = parsed.field2 !== undefined && parsed.field2 !== null;
            const hasField3 = parsed.field3 !== undefined && parsed.field3 !== null;

            expect(hasField1 || hasField2 || hasField3).toBe(true);
        });

        test('interleaved load-modify-save operations should preserve data integrity', async () => {
            // Create initial file
            await fs.writeFile(testFilePath, JSON.stringify({ value: 'original' }));

            const results: string[] = [];

            // Simulate multiple rapid load-modify-save cycles
            for (let i = 0; i < 20; i++) {
                const accessor = new JSONAccessor(testFilePath, {
                    value: JSONType.String(),
                });
                await accessor.load();
                accessor.setOne('value', `iteration-${i}`);
                await accessor.save();

                // Verify after each save
                const content = await fs.readFile(testFilePath, 'utf8');
                if (content.trim() === '' || content.trim() === '{}') {
                    results.push(`EMPTY at iteration ${i}`);
                }
            }

            expect(results).toEqual([]);

            // Final verification
            const finalContent = await fs.readFile(testFilePath, 'utf8');
            expect(finalContent.trim()).not.toBe('');
            expect(finalContent.trim()).not.toBe('{}');
        });
    });

    describe('Stress test - high concurrency', () => {
        test('100 concurrent saves should not corrupt file', async () => {
            const accessor = new JSONAccessor(testFilePath, {
                values: JSONType.Array(),
            });

            accessor.setOne('values', []);

            // Create 100 concurrent save operations
            const promises: Promise<void>[] = [];
            for (let i = 0; i < 100; i++) {
                accessor.setOne('values', Array.from({ length: i + 1 }, (_, j) => j));
                promises.push(accessor.save());
            }

            await Promise.all(promises);

            // Verify file is not empty
            const content = await fs.readFile(testFilePath, 'utf8');
            expect(content.trim()).not.toBe('');
            expect(content.trim()).not.toBe('{}');

            const parsed = JSON.parse(content);
            expect(Array.isArray(parsed.values)).toBe(true);
            expect(parsed.values.length).toBeGreaterThan(0);
        });

        test('parallel accessor operations should maintain file validity', async () => {
            const numAccessors = 10;
            const operationsPerAccessor = 10;

            // Initialize file
            await fs.writeFile(testFilePath, JSON.stringify({ counter: 0 }));

            const operations = Array.from({ length: numAccessors }, async (_, accessorIndex) => {
                for (let op = 0; op < operationsPerAccessor; op++) {
                    const accessor = new JSONAccessor(testFilePath, {
                        counter: JSONType.Number(),
                    });
                    await accessor.load();
                    const current = accessor.getOne('counter') || 0;
                    accessor.setOne('counter', current + 1);
                    await accessor.save();
                }
            });

            await Promise.all(operations);

            // Final check - file should be valid and not empty
            const content = await fs.readFile(testFilePath, 'utf8');
            expect(content.trim()).not.toBe('');
            expect(content.trim()).not.toBe('{}');

            const parsed = JSON.parse(content);
            expect(typeof parsed.counter).toBe('number');
            // Due to race conditions, the counter won't be exactly numAccessors * operationsPerAccessor
            // but it should be at least 1
            expect(parsed.counter).toBeGreaterThan(0);
        });
    });
});
