import { pineconeindex } from "@/lib/pinecone";
import { embed } from "ai";
import { google } from "@ai-sdk/google"
import { withRetry, isRateLimitError } from "@/lib/retry";

export async function generateEmbeddings(text: string) {
    const { embedding } = await embed({
        model: google.embeddingModel("gemini-embedding-001"),
        value: text,
    })
    return embedding;
}

export async function indexCodebase(repoId: string,files:{path:string,content:string}[]) {
    const vectors =[];
    

    for(const file of files){
        const content =`File Path: ${file.path}\n\nContent:\n${file.content}`;
        const truncratedContent = content.slice(0, 8000);
        try {
            const embedding = await generateEmbeddings(truncratedContent);
            vectors.push({
                id: `${repoId}-${file.path.replace(/\//g, '-')}`,
                values: embedding,
                metadata: {
                    repoId,
                    path: file.path,
                    content:truncratedContent
                }
            });
        } catch (error) {
            console.error(`Error generating embedding for file ${file.path}:`, error);
            
        }

    }
    if (vectors.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await withRetry(
                () => pineconeindex.upsert({ records: batch }),
                {
                    maxRetries: 3,
                    baseDelayMs: 2000,
                    shouldRetry: isRateLimitError,
                }
            );
        }
    }
}

export async function retrieveContext(query: string, repoId: string, topK: number = 5) {
    const embedding = await generateEmbeddings(query);
    const results = await withRetry(
        () => pineconeindex.query({
            vector: embedding,
            topK,
            filter: { repoId },
            includeMetadata: true,
        }),
        {
            maxRetries: 3,
            baseDelayMs: 1000,
            shouldRetry: isRateLimitError,
        }
    );
    return results.matches.map(match => match.metadata?.content as string).filter(Boolean)
}





