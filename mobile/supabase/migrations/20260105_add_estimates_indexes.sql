-- Database Performance Optimization Migration
-- Created: 2026-01-05
-- Purpose: Add indexes to improve query performance on estimates table

-- =============================================================================
-- INDEXES FOR ESTIMATES TABLE
-- =============================================================================

-- Index 1: Composite index for payment status checks (most frequent query pattern)
-- Used by: checkEstimatePaymentStatus(), getPaidEstimate()
-- Query pattern: WHERE id = ? AND paid = ?
CREATE INDEX IF NOT EXISTS idx_estimates_id_paid
ON estimates(id, paid);

-- Index 2: Index for finding unpaid estimates by creation time
-- Used by: Recent estimate lookups, cleanup jobs
-- Query pattern: WHERE paid = false AND created_at >= ?
CREATE INDEX IF NOT EXISTS idx_estimates_created_paid
ON estimates(created_at DESC, paid);

-- Index 3: Partial index for paid estimates only (reduces index size)
-- Used by: getPaidEstimate() - frequently accessed
-- Only indexes rows where paid = true
CREATE INDEX IF NOT EXISTS idx_estimates_paid_true
ON estimates(id)
WHERE paid = true;

-- Index 4: Index for payment_id lookups (webhook verification)
-- Used by: Payment webhook handlers to find estimates by Stripe payment ID
CREATE INDEX IF NOT EXISTS idx_estimates_payment_id
ON estimates(payment_id)
WHERE payment_id IS NOT NULL;

-- =============================================================================
-- VERIFY INDEXES
-- =============================================================================

-- To verify indexes were created, run:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'estimates';

-- =============================================================================
-- PERFORMANCE NOTES
-- =============================================================================

-- Expected improvements:
-- 1. Payment status checks: ~10x faster (uses idx_estimates_id_paid)
-- 2. Paid estimate retrieval: ~5x faster (uses idx_estimates_paid_true)
-- 3. Webhook processing: ~10x faster (uses idx_estimates_payment_id)
-- 4. Recent estimates query: ~3x faster (uses idx_estimates_created_paid)

-- Index maintenance:
-- - Indexes are automatically maintained by PostgreSQL
-- - Monitor index usage with: SELECT * FROM pg_stat_user_indexes WHERE relname = 'estimates';
-- - If an index shows low usage, consider removing it to reduce write overhead
