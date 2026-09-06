import { MongoClient } from 'mongodb';

const mainUri = process.env.MONGO_URI!;
// const forumsUri = process.env.FORUMS_MONGO_URI!;

declare global {
    var _mongoClient: MongoClient | undefined;
    // var _forumsMongoClient: MongoClient | undefined;
}

export async function connectToMongoClient(): Promise<MongoClient> {
    if (!global._mongoClient) {
        global._mongoClient = new MongoClient(mainUri);
        await global._mongoClient.connect();
        console.log('✅ Connected to Main MongoDB.');
    }

    return global._mongoClient;
}

// export async function connectToForumsMongoClient(): Promise<MongoClient> {
//     if (!global._forumsMongoClient) {
//         global._forumsMongoClient = new MongoClient(forumsUri);
//         await global._forumsMongoClient.connect();
//         console.log('✅ Connected to Forums MongoDB.');
//     }

//     return global._forumsMongoClient;
// }