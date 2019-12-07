import { Block } from "./Block";

export class BlockChain {
    private _chain: Block[];

    constructor() {
        this._chain = [this.createGenesisBlock()]
    }

    private createGenesisBlock(): Block {
        return new Block(0, "01/01/2019", "Genesis block", "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock: Block): void {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain = [...this.chain, newBlock];
    }

    get chain(): Block[] {
        return this._chain;
    }

    set chain(chain: Block[]) {
        this._chain = chain;
    }
}