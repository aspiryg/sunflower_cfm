-- HNSW index for cosine similarity on cases.embedding (semantic search /
-- duplicate detection). Added manually — drizzle-kit does not emit vector
-- indexes. Safe to run before any rows are embedded.
CREATE INDEX IF NOT EXISTS "idx_cases_embedding_hnsw"
  ON "cases" USING hnsw ("embedding" vector_cosine_ops);
