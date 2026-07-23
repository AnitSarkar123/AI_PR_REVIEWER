# Architecture

## Overview

This repository contains a full-stack AI Pull Request Reviewer application. It leverages modern web technologies to process and review PRs automatically.

## Tech Stack

### Frontend

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS, Radix UI (shadcn/ui style components)
- **State Management & Data Fetching:** React Query

### Backend

- **Framework:** Next.js API Routes / Server Actions
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Vector Database:** Pinecone
- **Authentication:** Better Auth (with Polar SDK)

### AI and Background Jobs

- **AI Integration:** Vercel AI SDK (`@ai-sdk/google`, `@ai-sdk/openai-compatible`)
- **Background Processing:** Inngest

## High-Level Flow

1. **User Authentication:** Users authenticate via Better Auth.
2. **Webhook/API Trigger:** When a PR is created or updated, the system receives an event.
3. **Background Job:** Inngest queues the processing task.
4. **AI Review Generation:** The codebase structure is queried via Pinecone, and context is fed into the Vercel AI SDK to generate a review.
5. **Database Storage:** Results and logs are stored in PostgreSQL using Prisma.
6. **Frontend Display:** The React interface consumes the API to display the AI's review and suggestions to the user.
