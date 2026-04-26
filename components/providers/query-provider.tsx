"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [client] = React.useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            }
        }
    }))
    return (
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
    )
}