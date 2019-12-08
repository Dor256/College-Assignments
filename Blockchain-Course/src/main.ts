import { BlockChain } from "./BlockChain";
import { Transaction } from "./Transaction";

const oshCoin = new BlockChain();
oshCoin.createTransaction(new Transaction("address1", "address2", 100));
oshCoin.createTransaction(new Transaction("address2", "address1", 50));

console.log("Starting miner...")
oshCoin.minePendingTransactions("Address");
console.log(`Balance is ${oshCoin.getAddrssBalance("Address")}`);
console.log(oshCoin.chain);