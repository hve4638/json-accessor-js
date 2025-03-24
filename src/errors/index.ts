export class JSONAccessorError extends Error {
    constructor(message:string) {
        super(message);
        this.name = 'AccessorError';
    }
}