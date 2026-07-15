import { Pinecone } from '@pinecone-database/pinecone';
import { getPineconeIndexName } from './env';

const pineconeApiKey = process.env.PINECONE_DB_API_KEY || '';
const pineconeIndexName = getPineconeIndexName();

const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
});
export const pineconeindex = pinecone.index(pineconeIndexName);
