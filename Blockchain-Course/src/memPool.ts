import { dorPublicKey, shaharPublicKey } from "./wallets";

export const memPool = [
    { 
        from: dorPublicKey,
        to: shaharPublicKey,
        amount: 50
    },
    {
        from: shaharPublicKey,
        to: dorPublicKey,
        amount: 100
    },
    {
        from: shaharPublicKey,
        to: dorPublicKey,
        amount: 200
    },
    {
        from: dorPublicKey,
        to: shaharPublicKey,
        amount: 100
    },
    {
        from: dorPublicKey,
        to: shaharPublicKey,
        amount: 100
    },
    {
        from: dorPublicKey,
        to: shaharPublicKey,
        amount: 50
    },
    {
        from: dorPublicKey,
        to: shaharPublicKey,
        amount: 50
    },
    {
        from: dorPublicKey,
        to: shaharPublicKey,
        amount: 50
    }
];