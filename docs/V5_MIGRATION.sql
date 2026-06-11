-- V5 Migration: Payroll Module Setup

-- 1. Add hourly_rate to staff table (defaulting to ZAR 85.00/hour)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2) DEFAULT 85.00 CONSTRAINT chk_hourly_rate CHECK (hourly_rate >= 0);

-- 2. Create timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out TIMESTAMPTZ,
    hours_worked NUMERIC(5, 2),
    hourly_rate NUMERIC(10, 2) NOT NULL,
    total_pay NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'submitted' CONSTRAINT chk_timesheet_status CHECK (status IN ('submitted', 'approved', 'paid')),
    approved_by UUID REFERENCES staff(id),
    approved_at TIMESTAMPTZ,
    CONSTRAINT chk_timesheet_times CHECK (clock_out IS NULL OR clock_out > clock_in)
);

-- 3. Enable Row-Level Security (RLS) on timesheets
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for timesheets

-- Policy A: Admins have full access to all timesheets
CREATE POLICY admin_all_timesheets ON timesheets
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid() AND staff.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid() AND staff.role = 'admin'
        )
    );

-- Policy B: Mechanics can view their own timesheets
CREATE POLICY mechanic_view_own ON timesheets
    FOR SELECT
    TO authenticated
    USING (
        staff_id = auth.uid()
    );

-- Policy C: Mechanics can insert/clock-in their own timesheet
CREATE POLICY mechanic_clock_in ON timesheets
    FOR INSERT
    TO authenticated
    WITH CHECK (
        staff_id = auth.uid() AND clock_out IS NULL AND status = 'submitted'
    );

-- Policy D: Mechanics can update/clock-out their own timesheet
CREATE POLICY mechanic_clock_out ON timesheets
    FOR UPDATE
    TO authenticated
    USING (
        staff_id = auth.uid() AND clock_out IS NULL
    )
    WITH CHECK (
        staff_id = auth.uid() AND status = 'submitted'
    );

-- 5. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_timesheets_staff_id ON timesheets(staff_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_clock_in ON timesheets(clock_in);
