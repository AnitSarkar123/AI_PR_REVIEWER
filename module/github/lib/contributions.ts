import { Octokit } from 'octokit';

interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface GraphQLResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
    };
  };
}

export type { ContributionCalendar, ContributionWeek, ContributionDay };

export async function fetchUserContribution(
    token: string,
    username: string
): Promise<ContributionCalendar | null> {
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
        const response = await octokit.graphql<GraphQLResponse>(query, {
            username
        })
        return response.user.contributionsCollection.contributionCalendar
    }
    catch (error) {
        console.error("Error fetching user contribution data:", error);
        throw error;
    }
}