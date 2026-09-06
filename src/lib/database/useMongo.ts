import {
    connectToMongoClient,
    // connectToForumsMongoClient,
} from '@/lib/database/mongodb';

export const useMongo = connectToMongoClient;
// export const useForumsMongo = connectToForumsMongoClient;