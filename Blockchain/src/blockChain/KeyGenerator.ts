import { ec } from "elliptic";

const elliptic = new ec('secp256k1');

const key = elliptic.genKeyPair();
const publicKey = key.getPublic(true, 'hex');
const privateKey = key.getPrivate('hex');

console.log(`Your public key (also your wallet address, freely shareable): ${publicKey}`);
console.log(`Your private key (keep this secret! Use it to sign transactions): ${privateKey}`);