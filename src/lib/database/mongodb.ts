import { MongoClient } from 'mongodb';

const mainUri = process.env.MONGO_URI!;
const secondaryUri = process.env.SECONDARY_MONGO_URI || process.env.SECURE_SHARE_MONGO_URI;

declare global {
    var _mongoClient: MongoClient | undefined;
    var _secondaryMongoClient: MongoClient | undefined;
    var _cleanupIntervalStarted: boolean | undefined;
}

export async function connectToMongoClient(): Promise<MongoClient> {
    if (!global._mongoClient) {
        global._mongoClient = new MongoClient(mainUri);
        await global._mongoClient.connect();
    }
    return global._mongoClient;
}

export async function connectToSecondaryMongoClient(): Promise<MongoClient> {
    if (!global._secondaryMongoClient) {
        if (!secondaryUri) {
            throw new Error("Secondary MongoDB is not configured. Set SECONDARY_MONGO_URI.");
        }
        global._secondaryMongoClient = new MongoClient(secondaryUri);
        await global._secondaryMongoClient.connect();

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
    return global._secondaryMongoClient;
}

export const connectToSecureShareMongoClient = connectToSecondaryMongoClient;