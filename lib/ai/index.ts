import { generateText, generateObject } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";

export const getAIModel = (preferredModel: string) => {
    switch (preferredModel) {
        case "openai":
            const openai = createOpenAICompatible({
                baseURL: process.env.OPENAI_COMPATIBLE_BASE_URL || "https://api.openai.com/v1",
                name: 'openai',
                apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_COMPATIBLE_API_KEY,
            });
            return openai.chatModel(process.env.OPENAI_MODEL || "gpt-4o");
        case "anthropic":
            const anthropic = createAnthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
            return anthropic("claude-3-5-sonnet-20240620");
        case "google":
        default:
            const google = createGoogleGenerativeAI({
                apiKey: process.env.GEMINI_API_KEY,
            });
            return google("gemini-1.5-pro-latest");
    }
};
