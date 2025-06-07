export class JSONAccessorError extends Error {
    constructor(message:string) {
        super(message);
        this.name = 'AccessorError';
    }
}

export class UnserializableTypeError extends JSONAccessorError {
    constructor(key:string, value:unknown) {
        super(`Unserializable data: '${value}' for field '${key}'`);
        this.name = 'UnserializableTypeError';
    }
}

export class IncompatibleTypeError extends JSONAccessorError {
    constructor(message:string) {
        super(message);
        this.name = 'IncompatibleTypeError';
    }
}