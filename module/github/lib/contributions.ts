import { Octokit } from 'octokit';

export async function fetchUserContribution(
    token: string,
    username: string
) {
    const octokit = new Octokit({
        auth: token
    })
    const query = `
query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
            totalContributions
                weeks {
                    contributionDays {
                        contributionCount
                        date
                        color
                    }
                }
        }
      }
    }
  }
`
    try {
        const response: any = await octokit.graphql(query, {
            username
        })
        return response.user.contributionsCollection.contributionCalendar
    }
    catch (error) {
        console.error("Error fetching user contribution data:", error);
        throw error;
    }
}
