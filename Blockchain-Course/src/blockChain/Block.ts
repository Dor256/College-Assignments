import SHA256 from "crypto-js/sha256";
import MerkleTree from "merkletreejs/dist/index";
import { Transaction } from "./Transaction";
import { BloomFilter } from "bloomfilter";

export type Data = {
    amount: number
}

export class Block {
    private timestamp: string;
    private _transactions: Transaction[];
    private _previousHash: string;
    private _hash: string;
    private _nonce: number;
    private merkletree: any;
    private bloomFilter: BloomFilter;

    constructor(timestamp: string, transactions: Transaction[], previousHash = '') {
        this.timestamp = timestamp;
        this._transactions = transactions;
        this._previousHash = previousHash;
        this._nonce = 0;
        this._hash = this.calculateHash();
        this.merkletree = new MerkleTree(transactions.map((leaf) => leaf.calculateHash()), SHA256);
        this.bloomFilter = new BloomFilter(8192, 16);
    }

    calculateHash(): string {
        return SHA256(this.previousHash + this.timestamp + this.merkletree + this.nonce).toString();
    }
    
    mineBlock(difficulty: number): void {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block Mined: ${this.hash}`);
        this.initBloomFilter();
    }

    hasValidTransactions(): boolean {
        return this.transactions.every((transaction) => transaction.isValid());
    }

    initBloomFilter(): void {
        this.transactions.forEach((transction) => this.bloomFilter.add(transction.calculateHash()));
    }

    hasTransaction(txHash: string): boolean {
        if (this.bloomFilter.test(txHash)) {
            return this.transactions.map((transaction) => transaction.calculateHash()).includes(txHash);
        }
        return false;
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

    get nonce(): number {
        return this._nonce;
    }

    set nonce(nonce: number) {
        this._nonce = nonce;
    }

    get transactions(): Transaction[] {
        return this._transactions;
    }
}
