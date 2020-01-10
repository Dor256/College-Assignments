import topology from "fully-connected-topology";
import { memPool } from "./memPool";
import { BlockChain } from "./blockChain/BlockChain";
import { Transaction } from "./blockChain/Transaction";
import { ec } from "elliptic";
import { dorPrivateKey, shaharPrivateKey, minerPrivateKey } from "./wallets";
import { Connection } from 'fully-connected-topology';

const elliptic = new ec('secp256k1');
const spv1Key = elliptic.keyFromPrivate(dorPrivateKey);
const spv1Wallet = spv1Key.getPublic(true, 'hex');

const spv2Key = elliptic.keyFromPrivate(shaharPrivateKey);
const spv2Wallet = spv2Key.getPublic(true, 'hex');

const minerKey = elliptic.keyFromPrivate(minerPrivateKey);
const minerWallet = minerKey.getPublic(true, 'hex');

console.log('Setting up network connections: full + 2 spv nodes\n_______________________________________');

const MINER_NODE_IP = '127.0.0.1:4001';
const SPV1_NODE_IP = '127.0.0.1:4002';
const SPV2_NODE_IP = '127.0.0.1:4003';

const minerNode = topology(MINER_NODE_IP, [SPV1_NODE_IP, '127.0.0.1:4003']);
const spv1 = topology(SPV1_NODE_IP, [MINER_NODE_IP, '127.0.0.1:4003']);
const spv2 = topology('127.0.0.1:4003', [MINER_NODE_IP, SPV1_NODE_IP]);

const ipToNodeName: {[key: string]: string} = {
  [MINER_NODE_IP]: 'Miner',
  [SPV1_NODE_IP]: 'SPV1',
  [SPV2_NODE_IP]: 'SPV2',
};

let connectedCount = 0;

let reportOnAllConnectionsOnline: () => void | undefined;
const allConnectionOnline = new Promise((onAllConnectionsOnline) => {
  reportOnAllConnectionsOnline = (): void => {
    console.log('ALL CONNECTIONS ONLINE\n\n');
    return onAllConnectionsOnline();
  };
});

const kaiCoin = new BlockChain();

async function delay(timeout: number): Promise<void> {
  await new Promise((res) => setTimeout(() => res(), timeout));
}

type NetworkRequest = {
  type: 'tx',
  rawTransactions: RawTransaction[]
} | {
  type: 'findTx',
  txHash: string
};

const writeRequest = (request: NetworkRequest, connection: Connection): void => {
  connection.write(JSON.stringify(request));
};

type RawTransaction = {fromAddress: string, toAddress: string, amount: number, signature: string, timestamp: string, hash: string};
const BLOCK_NOT_FOUND = 'BLOCK_NOT_FOUND';

minerNode.on('connection', async (connection, peer) => {
  connection.setEncoding('utf8');
  console.log('Miner node is connected to', ipToNodeName[peer]);
  connectedCount++;
  if (connectedCount === 6) {
    reportOnAllConnectionsOnline();
  }
  connection.on('data', (data: string) => {
    const req: NetworkRequest = JSON.parse(data);
    if (req.type === 'tx') {
      const dataObj = req.rawTransactions;
      // console.log(dataObj);
      dataObj.forEach((pending) => {
        const transaction = new Transaction(pending.fromAddress, pending.toAddress, pending.amount, pending.timestamp);
        transaction.signature = pending.signature;
        kaiCoin.addTransaction(transaction);
        if (kaiCoin.pendingTransactions.length > 3) {
          console.log("Reached 4 pending transactions, Mining...");
          kaiCoin.minePendingTransactions(minerWallet);
          console.log(`Miner's Balance: ${kaiCoin.getAddressBalance(minerWallet)}`);
          console.log(`SPV1's Balance: ${kaiCoin.getAddressBalance(spv1Wallet)}`);
          console.log(`SPV2's Balance: ${kaiCoin.getAddressBalance(spv2Wallet)}\n`);
        }
      });
    } else {
      const txHash = req.txHash;
      const block = kaiCoin.findTranscation(txHash);
      connection.write(block ? block.hash : BLOCK_NOT_FOUND);
    }
  });
});

const sendTransactions = async (keys: {public: string, private: ec.KeyPair, name: string}, connection: Connection, memPool: Array<{from: string, to: string, amount: number}>): Promise<RawTransaction[]> => {
  const transactions = memPool.filter((pending) => pending.from === keys.public).map((pending) => {
    const { from, to, amount } = pending;
    const transaction = new Transaction(from, to, amount);
    transaction.signTransaction(keys.private);
    if (!transaction.signature) {
      throw new Error('Transaction is not signed!');
    }
    return { fromAddress: from, toAddress: to, amount, signature: transaction.signature, timestamp: transaction.timestamp, hash: transaction.calculateHash() };
  });
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    console.log(`Node ${keys.name} sending transaction - ${transaction.amount}`);
    writeRequest({type: 'tx', rawTransactions: [transaction]}, connection);
    await delay(500);
  }
  return transactions;
};

const onCheckTransactionResponse = (data: string): void => {
  if (data === BLOCK_NOT_FOUND) {
    console.log(`Transaction does not exist on the blockchain\n`);
  } else {
    const block: string = data;
    console.log(`Received a block (${block}) that might contain the transaction, verifying...`);
    const headers = kaiCoin.blockHeaders;
    const matchingBlockHeader = headers.find((header) => block === header);
    if (matchingBlockHeader) {
      console.log(`Found matching header, transaction is in block - (${block})\n`);
    } else {
      console.log(headers, block);
      console.log('Got an invalid block, someone has tried to fool me!\n');
    }
  }
};

spv1.on('connection', async (connection, peer) => {
  connection.setEncoding('utf8');
  console.log('SPV1 is connected to', ipToNodeName[peer]);
  const isMinerNodeConnection = peer === MINER_NODE_IP;
  connectedCount++;
  if (connectedCount === 6) {
    reportOnAllConnectionsOnline();
  }
  await allConnectionOnline;

  if (isMinerNodeConnection) {
    await sendTransactions({private: spv1Key, public: spv1Wallet, name: 'SPV1'}, connection, memPool);
  }
});

spv2.on('connection', async (connection, peer) => {
  connection.setEncoding('utf8');
  console.log('SPV2 is connected to', ipToNodeName[peer]);
  connectedCount++;
  if (connectedCount === 6) {
    reportOnAllConnectionsOnline();
  }

  const isMinerNodeConnection = peer === MINER_NODE_IP;
  if (isMinerNodeConnection) {
    connection.on('data', onCheckTransactionResponse);
  }
  await allConnectionOnline;

  
  if (isMinerNodeConnection) {
    // console.log('SPV2 sending transactions to network\n_________________');
    const transactions = await sendTransactions({private: spv2Key, public: spv2Wallet, name: 'SPV2'}, connection, memPool);

    await delay(3000);
    console.log(`Checking if transaction ${transactions[0].hash} is on the blockchain:`);
    writeRequest({
      type: 'findTx',
      txHash: transactions[0].hash
    }, connection);
  
    await delay(3000);
    console.log(`Checking if a NON-existing transaction - 123123123 is on the blockchain:`);
    writeRequest({
      type: 'findTx',
      txHash: '123123123'
    }, connection);
  }
});
