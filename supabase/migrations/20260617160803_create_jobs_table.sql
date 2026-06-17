-- Jobs table for ClinConnect
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Remote / Unspecified',
  category TEXT NOT NULL DEFAULT 'Other',
  stipend TEXT,
  eligibility TEXT,
  apply_url TEXT NOT NULL,
  posted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  verified BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Public read policy (all can read active jobs)
CREATE POLICY "read_active_jobs" ON jobs FOR SELECT
  USING (active = true);

-- Create index for common queries
CREATE INDEX idx_jobs_active ON jobs(active);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_location ON jobs(location);

-- Insert some sample job data
INSERT INTO jobs (title, company, location, category, stipend, eligibility, apply_url, posted_date, verified, source) VALUES
('Clinical Research Intern', 'MediTrials CRO', 'Mumbai, India', 'Intern', '₹15,000 / month', 'PharmD or B.Pharm students, 2nd year and above', 'https://example.com/apply/1', '2024-01-15', true, 'LinkedIn'),
('Clinical Data Analyst', 'HealthTech Solutions', 'Bangalore, India', 'Full-time', '₹6-8 LPA', 'B.Pharm/M.Pharm with 1-2 years experience in clinical data management', 'https://example.com/apply/2', '2024-01-20', true, 'Company Website'),
('Pharmacovigilance Associate', 'DrugSafety Pharma', 'Hyderabad, India', 'Full-time', '₹5-7 LPA', 'PharmD/B.Pharm with knowledge of ICSR case processing', 'https://example.com/apply/3', '2024-02-01', true, 'Indeed'),
('Clinical Trial Coordinator', 'Cura Hospital', 'Delhi, India', 'Full-time', '₹4-6 LPA', 'B.Pharm or life sciences graduate, good communication skills', 'https://example.com/apply/4', '2024-02-10', true, 'Hospital Jobs'),
('Medical Writer', 'DocuMed Sciences', 'Remote', 'Full-time', '₹7-10 LPA', 'PharmD/M.Pharm with 2+ years in medical writing', 'https://example.com/apply/5', '2024-02-15', true, 'Naukri'),
('Regulatory Affairs Intern', 'PharmaReg Consultancy', 'Ahmedabad, India', 'Intern', '₹12,000 / month', 'Final year PharmD/B.Pharm students', 'https://example.com/apply/6', '2024-02-20', false, 'LinkedIn'),
('Clinical Operations Associate', 'ClinWorld CRO', 'Chennai, India', 'Full-time', '₹5-7 LPA', 'B.Pharm with clinical trial operations knowledge', 'https://example.com/apply/7', '2024-03-01', true, 'Company Portal'),
('Quality Assurance Trainee', 'QualiPharm Labs', 'Pune, India', 'Intern', '₹10,000 / month', 'B.Pharm freshers interested in GMP/QA', 'https://example.com/apply/8', '2024-03-05', true, 'Direct'),
('Clinical Research Fellow', 'Apex Medical Center', 'Kolkata, India', 'Fellowship', '₹40,000 / month', 'PharmD completed, research interest required', 'https://example.com/apply/9', '2024-03-10', true, 'Institutional'),
('Biostatistics Intern', 'DataDriven Trials', 'Remote', 'Intern', '₹18,000 / month', 'Statistics/Biostatistics background, R or Python knowledge', 'https://example.com/apply/10', '2024-03-15', true, 'Internshala');