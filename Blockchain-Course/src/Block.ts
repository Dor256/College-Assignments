import SHA256 from "crypto-js/sha256";

export type Data = {
    amount: number;
}

export class Block {
    private index: number;
    private timestamp: string;
    private data: Data | string;
    private _previousHash: string;
    private _hash: string;

    constructor(index: number, timestamp: string, data: Data | string, previousHash: string = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this._previousHash = previousHash;
        this._hash = this.calculateHash();
    }

    calculateHash(): string {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }

    get previousHash(): string {
        return this._previousHash;
    }

    set previousHash(previousHash: string) {
        this._previousHash = previousHash;
    }

    get hash(): string {
        return this._hash;
    }

    set hash(hash: string) {
        this._hash = hash;
    }
}
