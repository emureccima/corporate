import { Client, Account, Databases, Storage, Functions } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export const appwriteConfig = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  membersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_COLLECTION_ID!,
  eventsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID!,
  savingsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_SAVINGS_COLLECTION_ID!,
  loansCollectionId: process.env.NEXT_PUBLIC_APPWRITE_LOANS_COLLECTION_ID!,
  paymentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID!,
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!,
};

export default client;