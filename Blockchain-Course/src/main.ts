import { Block } from "./Block";
import { BlockChain } from "./BlockChain";

const snoopCoin = new BlockChain();
snoopCoin.addBlock(new Block(1, "20/01/2019", { amount: 4 }));
snoopCoin.addBlock(new Block(2, "20/02/2019", { amount: 8 }));

console.log(JSON.stringify(snoopCoin, null, 4));