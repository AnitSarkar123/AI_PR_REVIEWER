import { Octokit } from 'octokit';

export class TokenExpiredError extends Error {
	constructor(message: string = "GitHub access token has expired") {
		super(message);
		this.name = "TokenExpiredError";
	}
}

export async function validateToken(token: string): Promise<boolean> {
	try {
		const octokit = new Octokit({ auth: token });
		await octokit.rest.users.getAuthenticated();
		return true;
	} catch (error: any) {
		if (error.status === 401) {
			throw new TokenExpiredError();
		}
		return false;
	}
}
