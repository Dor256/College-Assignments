import { BlockChain } from "./BlockChain";
import { Block } from "./Block";
import { Transaction } from "./Transaction";
import { ec } from "elliptic";
import { privateKey } from "../wallet";
jest.mock("./Block");
jest.mock("./Transaction");

describe('Valid BlockChain', () => {
    it('Adds a block', () => {
        const elliptic = new ec('secp256k1');
        const key = elliptic.keyFromPrivate(privateKey);
        const walletAddress = key.getPublic(true, 'hex');
        const blockChain = new BlockChain();
        const transaction = new Transaction(walletAddress, "address2", 100);
        transaction.signTransaction(key);
        blockChain.addTransaction(transaction);
        blockChain.minePendingTransactions(walletAddress);
        expect(blockChain.chain.length).toBe(2);
    });

    it('Creates a consistent hash', () => {
        const elliptic = new ec('secp256k1');
        const key = elliptic.keyFromPrivate(privateKey);
        const walletAddress = key.getPublic(true, 'hex');
        const blockChain = new BlockChain();
        const transaction = new Transaction(walletAddress, "address2", 100);
        transaction.signTransaction(key);
        blockChain.addTransaction(transaction);
        const currentBlock = blockChain.chain[0];
        expect(currentBlock.hash).toBe(currentBlock.calculateHash());
    });

    it('Matches the previous hash', () => {
        const elliptic = new ec('secp256k1');
        const key = elliptic.keyFromPrivate(privateKey);
        const walletAddress = key.getPublic(true, 'hex');
        const blockChain = new BlockChain();
        const transaction = new Transaction(walletAddress, "address2", 100);
        transaction.signTransaction(key);
        blockChain.addTransaction(transaction);
        const prevBlock = blockChain.chain[0];
        const currentBlock = blockChain.chain[1];
        expect(currentBlock.previousHash).toBe(prevBlock.hash);
    });

    it("Generates an invalid chain", () => {
        const elliptic = new ec('secp256k1');
        const key = elliptic.keyFromPrivate(privateKey);
        const walletAddress = key.getPublic(true, 'hex');
        const generateHash = jest.fn();
        Block.prototype.calculateHash = generateHash;
        generateHash.mockReturnValue("Hash");
        const blockChain = new BlockChain();
        const transaction = new Transaction(walletAddress, "address2", 100);
        transaction.signTransaction(key);
        blockChain.addTransaction(transaction);
        expect(blockChain.isValidChain()).toBe(false);
    })
});