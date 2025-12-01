-- Migration: Add advance payment and dues fields to incomes table
-- This migration preserves all existing data by setting advanceAmount = amount for existing records

-- Step 1: Add new columns as nullable with safe defaults
ALTER TABLE "incomes" 
  ADD COLUMN "totalAmount" DOUBLE PRECISION,
  ADD COLUMN "advanceAmount" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN "dueAmount" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN "dueDate" TIMESTAMP(3),
  ADD COLUMN "isDuePaid" BOOLEAN DEFAULT true,
  ADD COLUMN "duePaidDate" TIMESTAMP(3);

-- Step 2: Update existing records to preserve all current data
-- All existing income entries are treated as fully paid with no dues
UPDATE "incomes" 
SET 
  "advanceAmount" = "amount",
  "dueAmount" = 0,
  "isDuePaid" = true
WHERE "advanceAmount" IS NULL OR "advanceAmount" = 0;

