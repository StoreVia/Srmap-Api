import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI!;
let client: MongoClient;

declare global {
    var _mongoClient: MongoClient | undefined;
}

export async function connectToMongoClient(): Promise<MongoClient> {
    if (!global._mongoClient) {
        global._mongoClient = new MongoClient(uri);
        await global._mongoClient.connect();
        console.log('✅ Connected to MongoDB.');
    }
    client = global._mongoClient;
    return client;
}