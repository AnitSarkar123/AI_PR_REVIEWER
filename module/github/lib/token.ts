import prisma from '@/lib/db';
import { requireSession } from '@/lib/server-action';

export const getGithubToken = async () => {
    const session = await requireSession()
    const account = await prisma.account.findFirst({
        where: {
            userId: session.id,
            providerId: "github"
        }
    })
    if (!account?.accessToken) {
        throw new Error("Account not found")
    }
    return account.accessToken
}
