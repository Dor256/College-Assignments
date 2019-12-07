import { BlockChain } from "./BlockChain";
import { Block } from "./Block";
jest.mock("./Block");

describe('Valid BlockChain', () => {
    const blockChain = new BlockChain();
    blockChain.addBlock(new Block(1, new Date().toString(), { amount: 4 }));
    const prevBlock = blockChain.chain[0];
    const currentBlock = blockChain.chain[1];

    it('Adds a block', () => {
        expect(blockChain.chain.length).toBe(2);
    });

    it('Creates a consistent hash', () => {
        expect(currentBlock.hash).toBe(currentBlock.calculateHash());
    });

    it('Matches the previous hash', () => {
        expect(currentBlock.previousHash).toBe(prevBlock.hash);
    });
});