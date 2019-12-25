import topology from "fully-connected-topology";
import { memPool } from "./memPool";
import { BlockChain } from "./blockChain/BlockChain";
import { Transaction } from "./blockChain/Transaction";
import { ec } from "elliptic";
import { dorPrivateKey, shaharPrivateKey, minerPrivateKey } from "./wallets/index";

const elliptic = new ec('secp256k1');
const dorKey = elliptic.keyFromPrivate(dorPrivateKey);
const dorWallet = dorKey.getPublic(true, 'hex');

const shaharKey = elliptic.keyFromPrivate(shaharPrivateKey);
const shaharWallet = shaharKey.getPublic(true, 'hex');

const minerKey = elliptic.keyFromPrivate(minerPrivateKey);
const minerWallet = minerKey.getPublic(true, 'hex');

const minerNode = topology('127.0.0.1:4001', ['127.0.0.1:4002', '127.0.0.1:4003']);
const dor = topology('127.0.0.1:4002', ['127.0.0.1:4001', '127.0.0.1:4003']);
const shahar = topology('127.0.0.1:4003', ['127.0.0.1:4001', '127.0.0.1:4002']);


type RawTransaction = {fromAddress: string, toAddress: string, amount: number, signature: string, timestamp: string};

const kaiCoin = new BlockChain();
minerNode.on('connection', (connection, peer) => {
  connection.setEncoding('utf8');
  connection.on('data', (data: string) => {
    const dataObj: RawTransaction[] = JSON.parse(data);
    dataObj.forEach((pending) => {
      console.log(pending);
      const transaction = new Transaction(pending.fromAddress, pending.toAddress, pending.amount, pending.timestamp);
      transaction.signature = pending.signature;
      kaiCoin.addTransaction(transaction);
      console.log(kaiCoin.pendingTransactions.length);
      if (kaiCoin.pendingTransactions.length === 4) {
        console.log("Mining...");
        kaiCoin.minePendingTransactions(minerWallet);
        console.log(`Miner's Balance: ${kaiCoin.getAddressBalance(minerWallet)}`);
      }
    });
  });
  console.log('t1 is connected to', peer);
});

dor.on('connection', (connection, peer) => {
  connection.setEncoding('utf8');
  console.log('t2 is connected to', peer);
  const trans = memPool.filter((pending) => pending.from === dorWallet).map((pending) => {
    const { from, to, amount } = pending;
    const transaction = new Transaction(from, to, amount);
    transaction.signTransaction(dorKey);
    return { fromAddress: from, toAddress: to, amount, signature: transaction.signature, timestamp: transaction.timestamp };
  });
  connection.write(JSON.stringify(trans));
});

shahar.on('connection', (connection, peer) => {
  connection.setEncoding('utf8');
  console.log('t3 is connected to', peer);
  const trans = memPool.filter((pending) => pending.from === shaharWallet).map((pending) => {
    const { from, to, amount } = pending;
    const transaction = new Transaction(from, to, amount);
    transaction.signTransaction(shaharKey);
    return { fromAddress: from, toAddress: to, amount, signature: transaction.signature, timestamp: transaction.timestamp };
  });
  connection.write(JSON.stringify(trans));
});