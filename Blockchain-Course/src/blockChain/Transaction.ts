import SHA256 from "crypto-js/sha256";
import { ec } from "elliptic";

const elliptic = new ec('secp256k1');

export class Transaction {
    private _fromAddress: string | null;
    private _toAddress: string;
    private _amount: number;
    private _timestamp: string;
    private _signature?: string;

    constructor(fromAddress: string | null, toAddress: string, amount: number, timestamp: string = Date.now().toString()) {
        this._fromAddress = fromAddress;
        this._toAddress = toAddress;
        this._amount = amount;
        this._timestamp = timestamp;
    }

    calculateHash(): string {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
    }

    signTransaction(signingKey: ec.KeyPair): void {
        if(signingKey.getPublic(true, 'hex') !== this.fromAddress) {
            throw new Error("You can't sign transactions for other wallets!");
        }
        const hashTransaction = this.calculateHash();
        this.signature = signingKey.sign(hashTransaction, 'base64').toDER('hex');
    }

    isValid(): boolean {
        if(this.fromAddress === null) {
            return true;
        }
        if(!this.signature || this.signature.length === 0) {
            throw new Error("No signature in this transaction!");
        }
        const publicKey = elliptic.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

    get fromAddress(): string | null {
        return this._fromAddress;
    }

    get toAddress(): string {
        return this._toAddress;
    }

    get amount(): number {
        return this._amount;
    }

    get timestamp(): string {
        return this._timestamp;
    }

    get signature(): string | undefined {
        return this._signature;
    }

    set signature(signature: string | undefined) {
        this._signature = signature;
    }
}