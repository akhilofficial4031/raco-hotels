-- Add refund amount field to booking table (cancellation_reason and cancelled_at already exist)
ALTER TABLE booking ADD COLUMN refund_amount_cents INTEGER;
