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
  loanRequestsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_LOAN_REQUESTS_COLLECTION_ID!,
  paymentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID!,
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!,
};

// Validation function to check if required collections exist
export const validateCollections = async (): Promise<Array<{
  name: string;
  id: string;
  status: 'OK' | 'NOT_FOUND' | 'ERROR';
  error?: string;
}>> => {
  const requiredCollections = [
    { name: 'Members', id: appwriteConfig.membersCollectionId },
    { name: 'Payments', id: appwriteConfig.paymentsCollectionId },
    { name: 'Savings', id: appwriteConfig.savingsCollectionId },
    { name: 'Loans', id: appwriteConfig.loansCollectionId },
  ];

  const validationResults: Array<{
    name: string;
    id: string;
    status: 'OK' | 'NOT_FOUND' | 'ERROR';
    error?: string;
  }> = [];

  for (const collection of requiredCollections) {
    try {
      // Try to list documents to check if collection exists
      await databases.listDocuments(appwriteConfig.databaseId, collection.id);
      validationResults.push({ name: collection.name, id: collection.id, status: 'OK' });
    } catch (error: any) {
      if (error.code === 404) {
        validationResults.push({ name: collection.name, id: collection.id, status: 'NOT_FOUND' });
      } else {
        validationResults.push({ name: collection.name, id: collection.id, status: 'ERROR', error: error.message });
      }
    }
  }

  return validationResults;
};

export default client;