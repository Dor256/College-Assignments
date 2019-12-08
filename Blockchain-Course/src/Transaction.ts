export class Transaction {
    private _fromAddress: string | null;
    private _toAddress: string;
    private _amount: number;

    constructor(fromAddress: string | null, toAddress: string, amount: number) {
        this._fromAddress = fromAddress;
        this._toAddress = toAddress;
        this._amount = amount;
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
}