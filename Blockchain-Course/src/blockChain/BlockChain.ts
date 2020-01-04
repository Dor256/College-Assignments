import { Block } from "./Block";
import { Transaction } from "./Transaction";

export class BlockChain {
    private _chain: Block[];
    private _difficulty: number;
    private _pendingTransactions: Transaction[];
    private _miningReward: number;

    constructor() {
        this._difficulty = 3;
        this._pendingTransactions = [];
        this._miningReward = 100;
        this._chain = [this.createGenesisBlock()];
    }

    private createGenesisBlock(): Block {
        return new Block(Date.parse('01/01/2019').toString(), [], '0');
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress: string): void {
        const transactionReward = new Transaction(null, miningRewardAddress, this.miningReward);
        const transactionToMine = [...this.pendingTransactions.slice(0, 4), transactionReward];
        const block = new Block(Date.now().toString(), transactionToMine, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        this.pendingTransactions = this.pendingTransactions.filter((tran) => !transactionToMine.find((tr) => tr.calculateHash() === tran.calculateHash()));
        this.chain = [...this.chain, block];
    }

    getAddressBalance(address: string): number {
        const transactions = this.chain.flatMap((block) => block.transactions);
        const incomingAmount = transactions.reduce((incoming, transaction) => incoming + (transaction.toAddress === address ? transaction.amount : 0), 0);
        const outgoingAmount = transactions.reduce((outgoing, transaction) => outgoing - (transaction.fromAddress === address ? transaction.amount : 0), 0);
        return incomingAmount + outgoingAmount;
    }

    addTransaction(transaction: Transaction): void {
        if(!transaction.fromAddress) {
            throw new Error("Transactions must include a from address!");
        }
        if(!transaction.isValid()) {
            throw new Error("Can't add an invalid transaction to the chain!");
        }
        this.pendingTransactions = [...this.pendingTransactions, transaction];
    }

    isValidChain(): boolean {
        if(JSON.stringify(this.createGenesisBlock()) !== JSON.stringify(this.chain[0])){
            return false;
        }
        return this.chain.every((block, i) => {
            if(!this.chain[i+1]) {
                return true;
            }
            if(!this.chain[i+1].hasValidTransactions()) {
                return false;
            }
            return block.hash === block.calculateHash() && block.hash === this.chain[i+1].previousHash;
        });
    }

    findTranscation(txHash: string): Block | undefined {
        return this.chain.find((block) => {
            return block.hasTransaction(txHash);
        });
      }

    get blockHeaders(): string[] {
        return this.chain.map((block) => block.calculateHash());
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