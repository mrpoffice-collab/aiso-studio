-- Add agencies table for marketplace certification and matching

CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- The user who owns this agency

  -- Agency profile
  agency_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,

  -- Location
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',

  -- Specialization
  vertical_specialization TEXT[], -- e.g., ['restaurants', 'real-estate', 'legal']
  services_offered TEXT[], -- e.g., ['technical-seo', 'content-writing', 'ai-searchability']

  -- Portfolio
  portfolio_url TEXT,
  case_studies JSONB DEFAULT '[]'::jsonb, -- Array of case study objects
  client_count INTEGER DEFAULT 0,

  -- Certification
  certification_status TEXT DEFAULT 'pending' CHECK (certification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  certified_at TIMESTAMP,
  certification_notes TEXT,

  -- Marketplace settings
  accepting_leads BOOLEAN DEFAULT true,
  max_active_clients INTEGER DEFAULT 10,
  current_active_clients INTEGER DEFAULT 0,
  lead_response_time_hours INTEGER DEFAULT 24, -- How quickly they respond to leads

  -- Pricing (optional, for display)
  base_audit_price_cents INTEGER, -- What they charge for AI searchability audit
  hourly_rate_cents INTEGER,

  -- Performance metrics
  leads_received INTEGER DEFAULT 0,
  leads_accepted INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  average_response_time_hours DECIMAL(5,2),
  client_satisfaction_score DECIMAL(3,2), -- 0-5 rating

  -- Referral tracking (for commission calculations)
  total_referral_revenue_cents INTEGER DEFAULT 0,
  total_commission_paid_cents INTEGER DEFAULT 0,

  -- Metadata
  application_submitted_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who approved
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agencies_user ON agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(certification_status);
CREATE INDEX IF NOT EXISTS idx_agencies_accepting_leads ON agencies(accepting_leads);
CREATE INDEX IF NOT EXISTS idx_agencies_location ON agencies(city, state, country);
CREATE INDEX IF NOT EXISTS idx_agencies_vertical ON agencies USING GIN (vertical_specialization);
CREATE INDEX IF NOT EXISTS idx_agencies_services ON agencies USING GIN (services_offered);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_agencies_updated_at();

-- ============================================================================
-- Agency lead referrals table (for tracking marketplace leads sent to agencies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS agency_lead_referrals (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,

  -- Lead information
  lead_name TEXT,
  lead_email TEXT NOT NULL,
  lead_phone TEXT,
  lead_company TEXT,
  lead_url TEXT,

  -- Problem details
  technical_seo_audit_id INTEGER REFERENCES technical_seo_audits(id) ON DELETE SET NULL,
  issue_summary TEXT,
  estimated_deal_value_cents INTEGER, -- Estimated value of this engagement

  -- Status tracking
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'declined', 'converted', 'lost')),
  sent_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  converted_at TIMESTAMP,

  -- Revenue tracking (for commission calculation)
  actual_deal_value_cents INTEGER, -- What agency actually charged
  commission_percentage DECIMAL(5,2) DEFAULT 20.00, -- Default 20% commission
  commission_amount_cents INTEGER,
  commission_paid BOOLEAN DEFAULT false,
  commission_paid_at TIMESTAMP,

  -- Notes
  agency_notes TEXT,
  admin_notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_referrals_agency ON agency_lead_referrals(agency_id);
CREATE INDEX IF NOT EXISTS idx_lead_referrals_status ON agency_lead_referrals(status);
CREATE INDEX IF NOT EXISTS idx_lead_referrals_sent_at ON agency_lead_referrals(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_referrals_commission_unpaid ON agency_lead_referrals(commission_paid) WHERE commission_paid = false;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_agency_lead_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agency_lead_referrals_updated_at
  BEFORE UPDATE ON agency_lead_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_lead_referrals_updated_at();

-- ============================================================================
-- Trigger to update agency stats when referral status changes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_agency_stats_on_referral_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update agency stats based on referral status change
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    UPDATE agencies
    SET leads_accepted = leads_accepted + 1
    WHERE id = NEW.agency_id;
  END IF;

  IF NEW.status = 'converted' AND (OLD.status IS NULL OR OLD.status != 'converted') THEN
    UPDATE agencies
    SET
      leads_converted = leads_converted + 1,
      total_referral_revenue_cents = total_referral_revenue_cents + COALESCE(NEW.actual_deal_value_cents, 0)
    WHERE id = NEW.agency_id;
  END IF;

  -- Calculate response time
  IF NEW.responded_at IS NOT NULL AND OLD.responded_at IS NULL THEN
    UPDATE agencies
    SET average_response_time_hours = (
      SELECT AVG(EXTRACT(EPOCH FROM (responded_at - sent_at)) / 3600)
      FROM agency_lead_referrals
      WHERE agency_id = NEW.agency_id AND responded_at IS NOT NULL
    )
    WHERE id = NEW.agency_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agency_stats
  AFTER INSERT OR UPDATE ON agency_lead_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_stats_on_referral_change();
