# 🚀 [**AI_PR_REVIEWER**](https://github.com/AnitSarkar123/AI_PR_REVIEWER)

AI-powered GitHub code review platform that automatically reviews pull requests, provides actionable feedback, tracks repository activity, and helps developers maintain code quality.


---

## ✨ Features

### 🤖 AI Code Reviews

* Automatic pull request analysis
* AI-generated review comments
* Review history tracking
* PR quality insights

### 📦 Repository Management

* Connect GitHub repositories
* Search and manage repositories
* Repository activity tracking
* GitHub integration

### 📊 Dashboard & Analytics

* Contribution heatmap
* Commit statistics
* Pull request metrics
* Monthly activity reports

### 🔐 Authentication

* Secure GitHub authentication
* Session management
* Protected routes

### 💳 Subscription System

* Free and Pro plans
* Usage limits
* Subscription management
* Billing integration

### ⚡ Background Processing

* Automated repository indexing
* Asynchronous review generation
* Webhook handling
* Event-driven workflows

---

## 🏗️ Tech Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* TanStack Query
* Recharts

### Backend

* Next.js Server Actions
* Prisma ORM
* PostgreSQL
* Better Auth

### AI & Integrations

* Google AI SDK
* OpenAI Compatible SDK
* GitHub API
* Pinecone Vector Database

### Infrastructure

* Inngest
* Polar Payments
* GitHub Webhooks

---

## 📂 Project Structure

`````text
Repository
└──ai_pr_reviewer/
    ├── README.md
    ├── components.json
    ├── css.d.ts
    ├── eslint.config.mjs
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.mjs
    ├── prisma.config.ts
    ├── tsconfig.json
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.tsx
    │   ├── api/
    │   │   ├── auth/
    │   │   │   └── [...all]/
    │   │   │       └── route.ts
    │   │   ├── inngest/
    │   │   │   └── route.ts
    │   │   └── webhooks/
    │   │       └── github/
    │   │           └── route.ts
    │   └── dashboard/
    │       ├── layout.tsx
    │       ├── page.tsx
    │       ├── repository/
    │       │   └── page.tsx
    │       ├── reviews/
    │       │   └── page.tsx
    │       ├── settings/
    │       │   └── page.tsx
    │       └── subscriptions/
    │           └── page.tsx
    ├── components/
    │   ├── app-sidebar.tsx
    │   ├── providers/
    │   │   ├── query-provider.tsx
    │   │   ├── theme-provider.tsx
    │   │   └── toaster-provider.tsx
    │   └── ui/
    ├── hooks/
    │   └── use-mobile.ts
    ├── inngest/
    │   ├── client.ts
    │   └── functions/
    │       ├── index.ts
    │       └── review.ts
    ├── lib/
    │   ├── auth-client.ts
    │   ├── auth.ts
    │   ├── db.ts
    │   ├── pinecone.ts
    │   ├── utils.ts
    │   └── generated/
    │       └── prisma/
    │           ├── browser.ts
    │           ├── client.ts
    │           ├── commonInputTypes.ts
    │           ├── enums.ts
    │           ├── models.ts
    │           ├── internal/
    │           │   ├── class.ts
    │           │   ├── prismaNamespace.ts
    │           │   └── prismaNamespaceBrowser.ts
    │           └── models/
    │               ├── UserUsage.ts
    │               └── Verification.ts
    ├── module/
    │   ├── ai/
    │   │   ├── actions/
    │   │   │   └── index.ts
    │   │   └── lib/
    │   │       └── rag.ts
    │   ├── auth/
    │   │   ├── components/
    │   │   │   ├── login-ui.tsx
    │   │   │   └── logout.tsx
    │   │   └── utils/
    │   │       └── auth-utils.ts
    │   ├── dashboard/
    │   │   ├── actions/
    │   │   │   └── index.ts
    │   │   └── components/
    │   │       └── contribution-graph.tsx
    │   ├── github/
    │   │   └── lib/
    │   │       └── github.ts
    │   ├── payment/
    │   │   ├── actions/
    │   │   │   └── index.ts
    │   │   ├── config/
    │   │   │   └── polar.ts
    │   │   └── lib/
    │   │       └── subscription.ts
    │   ├── repository/
    │   │   ├── actions/
    │   │   │   └── index.ts
    │   │   ├── components/
    │   │   │   └── repository-skeleton.tsx
    │   │   └── hooks/
    │   │       ├── use-connect-repository.ts
    │   │       └── use-repositories.ts
    │   ├── review/
    │   │   └── actions/
    │   │       └── index.ts
    │   └── settings/
    │       ├── actions/
    │       │   └── index.ts
    │       └── components/
    │           ├── profile-form.tsx
    │           └── repository-list.tsx
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    │       ├── migration_lock.toml
    │       ├── 20260329133431_test/
    │       │   └── migration.sql
    │       ├── 20260329135849_authentication/
    │       │   └── migration.sql
    │       ├── 20260402162416_repository_model_added/
    │       │   └── migration.sql
    │       ├── 20260413093751_added_review_and_userusage/
    │       │   └── migration.sql
    │       ├── 20260417153032_update/
    │       │   └── migration.sql
    │       └── 20260426154209_added_polar_ids/
    │           └── migration.sql
    └── .github/
        ├── ISSUE_TEMPLATE/
        │   ├── bug_report.md
        │   ├── documentation.md
        │   └── feature_request.md
        └── PULL_REQUEST_TEMPLATE/
            └── PULL_REQUEST_TEMPLATE.

`````

---

## 🚀 Getting Started

### Prerequisites

* Node.js 20+
* PostgreSQL
* GitHub OAuth App
* Pinecone Account
* AI Provider API Key

### Installation
```bash
git clone https://github.com/your-username/AI_PR_REVIEWER.git
````
```bash
cd AI_PR_REVIEWER
````
```bash
npm install

`````

### Environment Variables

Create a `.env` file:

`````env
DATABASE_URL=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_GENERATIVE_AI_API_KEY=

PINECONE_API_KEY=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
`````

### Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔄 Workflow

1. Sign in with GitHub.
2. Connect repositories.
3. Configure GitHub webhook.
4. Open or update a Pull Request.
5. CodeHorse automatically:

   * Receives webhook events
   * Fetches PR changes
   * Generates AI review
   * Stores review results
6. View reviews from the dashboard.

---

## 📸 Screenshots

Add screenshots here:
<img width="1536" height="826" alt="image" src="https://github.com/user-attachments/assets/5385d29f-4674-4e0a-8844-707ae5872b6b" />
<img width="1536" height="788" alt="image" src="https://github.com/user-attachments/assets/54c65f03-7161-48cc-b9fd-5eea79c18c0b" />


---

## 🛣️ Roadmap

* [ ] Inline review comments
* [ ] Multi-model AI support
* [ ] Team workspaces
* [ ] Review quality scoring
* [ ] Slack integration
* [ ] GitLab support
* [ ] Bitbucket support

---

## 🤝 Contributing

Contributions are welcome.

```bash
fork → branch → commit → pull request
```

Please open an issue before submitting major changes.

---

## ⭐ Support

If you find this project useful:

* Star the repository
* Report bugs
* Suggest features
* Share feedback

Built with ❤️ using Next.js, Prisma, GitHub APIs, and AI.
