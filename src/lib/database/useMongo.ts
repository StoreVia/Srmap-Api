import { connectToMongoClient, connectToSecondaryMongoClient, connectToSecureShareMongoClient } from "@/lib/database/mongodb";

export const useMongo = connectToMongoClient;
export const useSecondaryMongo = connectToSecondaryMongoClient;
export const useSecureShareMongo = connectToSecureShareMongoClient;