import prisma from '@/lib/db';
import { requireSession } from '@/lib/server-action';
import { tokenCache } from './cache';
import { validateToken, TokenExpiredError } from './validation';

export { TokenExpiredError };

export const getGithubToken = async () => {
    const session = await requireSession();
    
    const cachedToken = tokenCache.get(session.id);
    if (cachedToken) {
        return cachedToken;
    }

    const account = await prisma.account.findFirst({
        where: {
            userId: session.id,
            providerId: "github"
        }
    });

    if (!account?.accessToken) {
        throw new Error("GitHub account integration not found");
    }

    const isValid = await validateToken(account.accessToken);
    if (!isValid) {
        throw new TokenExpiredError();
    }

    tokenCache.set(session.id, account.accessToken);

    return account.accessToken;
};
