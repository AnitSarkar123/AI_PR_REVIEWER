"use server"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session) {
            redirect("/login")
        }
        return session
    } catch (error) {
        console.error("[Auth] requireAuth error:", error);
        redirect("/login")
    }
}

export const requireUnAuth = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (session) {
            redirect("/");
        }
        return session;
    } catch (error) {
        console.error("[Auth] requireUnAuth error:", error);
        return null;
    }
}