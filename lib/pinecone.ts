import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_DB_API_KEY || '',
});
export const pineconeindex = pinecone.index('ai-pr-reviewer-vector-embeddings');