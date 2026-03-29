import { betterAuth } from "better-auth";
import prisma from "./db";
import {prismaAdapter } from "better-auth/adapters/prisma";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    socialProviders:{
        github:{
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            scope:["repo"]
        }
    }
});