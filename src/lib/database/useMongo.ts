import {
    connectToMongoClient,
    connectToSecureShareMongoClient,
} from '@/lib/database/mongodb';

export const useMongo = connectToMongoClient;
export const useSecureShareMongo = connectToSecureShareMongoClient;