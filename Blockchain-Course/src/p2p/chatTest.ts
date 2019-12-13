import topology from "fully-connected-topology";
import { BlockChain } from "../blockChain/BlockChain";
import { Transaction } from "../blockChain/Transaction";
import { ec } from "elliptic";
import { dorPrivateKey, shaharPrivateKey } from "../wallets/index";

const elliptic = new ec('secp256k1');
const dorKey = elliptic.keyFromPrivate(dorPrivateKey);
const dorWallet = dorKey.getPublic(true, 'hex');

const minerNode = topology('127.0.0.1:4001', ['127.0.0.1:4002', '127.0.0.1:4003']);
const node1 = topology('127.0.0.1:4002', ['127.0.0.1:4001', '127.0.0.1:4003']);
const node2 = topology('127.0.0.1:4003', ['127.0.0.1:4001', '127.0.0.1:4002']);

minerNode.on('connection', (connection: any, peer: string) => {
  connection.setEncoding('utf8');
  const kaiCoin = new BlockChain();
  connection.on('data', (data: any) => console.log(JSON.parse(data)));
  console.log('t1 is connected to', peer);
});

node1.on('connection', (connection: any, peer: string) => {
  connection.setEncoding('utf8');
  console.log('t2 is connected to', peer);
  const transaction = new Transaction('address1', 'address2', 50);
  connection.write(JSON.stringify(transaction));
});

node2.on('connection', (connection: any, peer: string) => {
  connection.setEncoding('utf8');
  console.log('t3 is connected to', peer);
});