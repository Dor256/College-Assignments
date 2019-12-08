import { BlockChain } from "./BlockChain";
import { Block } from "./Block";
import { Transaction } from "./Transaction";
jest.mock("./Block");
jest.mock("./Transaction");

describe('Valid BlockChain', () => {
    it('Adds a block', () => {
        const blockChain = new BlockChain();
        blockChain.createTransaction(new Transaction("address1", "address2", 100));
        blockChain.minePendingTransactions("Address");
        expect(blockChain.chain.length).toBe(2);
    });

    it('Creates a consistent hash', () => {
        const blockChain = new BlockChain();
        blockChain.createTransaction(new Transaction("address1", "address2", 100));
        blockChain.minePendingTransactions("Address");
        const currentBlock = blockChain.chain[1];
        expect(currentBlock.hash).toBe(currentBlock.calculateHash());
    });

    it('Matches the previous hash', () => {
        const blockChain = new BlockChain();
        blockChain.createTransaction(new Transaction("address1", "address2", 100));
        blockChain.minePendingTransactions("Address");
        const prevBlock = blockChain.chain[0];
        const currentBlock = blockChain.chain[1];
        expect(currentBlock.previousHash).toBe(prevBlock.hash);
    });

    it("Generates an invalid chain", () => {
        const generateHash = jest.fn();
        Block.prototype.calculateHash = generateHash;
        generateHash.mockReturnValue("Hash");
        const blockChain = new BlockChain();
        blockChain.createTransaction(new Transaction("address1", "address2", 100));
        blockChain.minePendingTransactions("Address");
        expect(blockChain.isValidChain()).toBe(false);
    })
});