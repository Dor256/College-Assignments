import { Block } from "./Block";
import { Transaction } from "./Transaction";

export class BlockChain {
    private _chain: Block[];
    private _difficulty: number;
    private _pendingTransactions: Transaction[];
    private _miningReward: number;

    constructor() {
        this._chain = [this.createGenesisBlock()];
        this._difficulty = 5;
        this._pendingTransactions = [];
        this._miningReward = 100;
    }

    private createGenesisBlock(): Block {
        return new Block("01/01/2019", [new Transaction(null, "Genesis", this.miningReward)], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string) {
        const transactionReward = new Transaction(null, miningRewardAddress, this.miningReward)
        this.pendingTransactions = [...this.pendingTransactions, transactionReward];
        const block = new Block(new Date().toString(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        console.log("Block successfuly mined!");
        this.chain = [...this.chain, block];
        this.pendingTransactions = [];
    }

    getAddrssBalance(address: string): number {
        return this.chain.map((block) => block.transactions.map((transaction) => transaction)
            .reduce((prev, curr) => {
                if(curr.fromAddress === address) {
                    prev -= curr.amount;
                }
                if(curr.toAddress === address) {
                    prev += curr.amount;
                }
                return prev;
            }, 0))[0];
    }

    createTransaction(transaction: Transaction) {
        this.pendingTransactions = [...this.pendingTransactions, transaction];
    }

    isValidChain(): boolean {
        return this.chain.every((block, i) => {
            if(!this.chain[i+1]) {
                return true;
            }
            return block.hash === block.calculateHash() && block.hash === this.chain[i+1].previousHash;
        });
    }

    get chain(): Block[] {
        return this._chain;
    }

    set chain(chain: Block[]) {
        this._chain = chain;
    }

    get difficulty(): number {
        return this._difficulty;
    }

    get pendingTransactions(): Transaction[] {
        return this._pendingTransactions;
    }

    set pendingTransactions(transactions: Transaction[]) {
        this._pendingTransactions = transactions;
    }

    get miningReward(): number {
        return this._miningReward;
    }
}