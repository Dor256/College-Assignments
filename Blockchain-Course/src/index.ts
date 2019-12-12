import { BlockChain } from "./blockChain/BlockChain";
import { Transaction } from "./blockChain/Transaction";
import { ec } from "elliptic";
import { privateKey } from "./wallet";

const elliptic = new ec('secp256k1');
const key = elliptic.keyFromPrivate(privateKey);
const walletAddress = key.getPublic(true, 'hex');

const oshCoin = new BlockChain();

const firstTransaction = new Transaction(walletAddress, "address2", 100);
firstTransaction.signTransaction(key);
oshCoin.addTransaction(firstTransaction);
oshCoin.minePendingTransactions(walletAddress);

const secondTransaction =  new Transaction(walletAddress, "address1", 50);
secondTransaction.signTransaction(key);
oshCoin.addTransaction(secondTransaction);
oshCoin.minePendingTransactions(walletAddress);

console.log(`Dor's Balance is ${oshCoin.getAddressBalance(walletAddress)}`);
console.log(`The chain is ${oshCoin.isValidChain() ? '' : 'not '}valid`);
console.log(oshCoin.chain);