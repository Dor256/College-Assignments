import topology from "fully-connected-topology";
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

const kaiCoin = new BlockChain();

type RawTransaction = {fromAddress: string, toAddress: string, amount: number, signature: string, timestamp: string};

minerNode.on('connection', (connection, peer) => {
  connection.setEncoding('utf8');
  connection.on('data', (data: string) => {
    const dataObj: RawTransaction = JSON.parse(data);
    const transaction = new Transaction(dataObj.fromAddress, dataObj.toAddress, dataObj.amount, dataObj.timestamp);
    transaction.signature = dataObj.signature;
    kaiCoin.addTransaction(transaction);
    console.log("Mining...");
    kaiCoin.minePendingTransactions(minerWallet);
    console.log(`Miner's Balance: ${kaiCoin.getAddressBalance(minerWallet)}`);
  });
  console.log('t1 is connected to', peer);
});

dor.on('connection', (connection, peer) => {
  connection.setEncoding('utf8');
  console.log('t2 is connected to', peer);
  const transaction = new Transaction(dorWallet, shaharWallet, 50);
  transaction.signTransaction(dorKey);
  connection.write(JSON.stringify({ fromAddress: dorWallet, toAddress: shaharWallet, amount: 50, signature: transaction.signature, timestamp: transaction.timestamp }));
});

shahar.on('connection', (connection, peer) => {
  connection.setEncoding('utf8');
  console.log('t3 is connected to', peer);
  const transaction = new Transaction(shaharWallet, dorWallet, 100);
  transaction.signTransaction(shaharKey);
  connection.write(JSON.stringify({ fromAddress: shaharWallet, toAddress: dorWallet, amount: 100, signature: transaction.signature, timestamp: transaction.timestamp }));
});