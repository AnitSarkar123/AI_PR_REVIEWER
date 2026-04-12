import { pineconeindex } from "@/lib/pinecone";
import {embed} from "ai";
import {google} from "@ai-sdk/google"
// import * as path from 'node:path';

// import { boolean } from "better-auth";

export async function generateEmbeddings(text: string) {
    const {embedding} = await embed({
        model: google.embeddingModel("gemini-embedding-001"),
        value: text,
    })
    console.log("Generated embedding:", embedding);
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
    if(vectors.length > 0){
        const batchSize = 100;
        for(let i=0;i<vectors.length;i+=batchSize){
            const batch = vectors.slice(i,i+batchSize);

            // Index the batch in Pinecone
            await pineconeindex.upsert({ records: batch });
        }
        console.log(`Indexed ${vectors.length} files for repository ${repoId}`);

    }


}
export async function retrieveContext(query: string, repoId:string,topK: number = 5) {
    const embedding = await generateEmbeddings(query);
    const results = await pineconeindex.query({
        vector: embedding,
        topK,
        filter: {
            repoId
        },
        includeMetadata:true})
        return results.matches.map(match => match.metadata?.content as string).filter(Boolean)
    
    }





