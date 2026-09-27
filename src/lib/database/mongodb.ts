import { MongoClient } from 'mongodb';

const mainUri = process.env.MONGO_URI!;
const secureShareUri = process.env.SECURE_SHARE_MONGO_URI;

declare global {
    var _mongoClient: MongoClient | undefined;
    var _secureShareMongoClient: MongoClient | undefined;
    var _cleanupIntervalStarted: boolean | undefined;
}

export async function connectToMongoClient(): Promise<MongoClient> {
    if (!global._mongoClient) {
        global._mongoClient = new MongoClient(mainUri);
        await global._mongoClient.connect();
    }

    return global._mongoClient;
}

export async function connectToSecureShareMongoClient(): Promise<MongoClient> {
    if (!global._secureShareMongoClient) {
        if (!secureShareUri) {
            throw new Error("Secure Share MongoDB is not configured. Set SECURE_SHARE_MONGO_URI.");
        }
        global._secureShareMongoClient = new MongoClient(secureShareUri);
        await global._secureShareMongoClient.connect();

        if (!global._cleanupIntervalStarted) {
            global._cleanupIntervalStarted = true;
            import('@/server/share/shareService').then(({ adminPurgeExpiredShares }) => {
                setInterval(() => {
                    adminPurgeExpiredShares().catch(() => {});
                }, 60 * 1000);
                setTimeout(() => {
                    adminPurgeExpiredShares().catch(() => {});
                }, 5000);
            }).catch(() => {});
        }
    }

    return global._secureShareMongoClient;
}