-- Add composite index on Repository(owner, name) for faster lookups
CREATE INDEX IF NOT EXISTS "repository_owner_name_idx" ON "repository" ("owner", "name");

-- Add composite index on Review(status, created_at) for faster filtered queries
CREATE INDEX IF NOT EXISTS "review_status_created_at_idx" ON "review" ("status", "created_at");
