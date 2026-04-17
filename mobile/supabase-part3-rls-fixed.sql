ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Professionals are publicly readable" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own estimates" ON estimates;
DROP POLICY IF EXISTS "Users can create estimates" ON estimates;
DROP POLICY IF EXISTS "Users can update own estimates" ON estimates;
DROP POLICY IF EXISTS "Customers can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Professionals can view active jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can create jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Professionals can view own purchases" ON job_purchases;
DROP POLICY IF EXISTS "Customers can view purchases of their jobs" ON job_purchases;
DROP POLICY IF EXISTS "Professionals can purchase jobs" ON job_purchases;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Customers can create reviews" ON reviews;
DROP POLICY IF EXISTS "Customers can update own reviews" ON reviews;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Professionals are publicly readable" ON profiles FOR SELECT USING (user_type = 'professional');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own estimates" ON estimates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create estimates" ON estimates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own estimates" ON estimates FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Customers can view own jobs" ON jobs FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Professionals can view active jobs" ON jobs FOR SELECT USING (
  status = 'active' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'professional')
);
CREATE POLICY "Customers can create jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Professionals can view own purchases" ON job_purchases FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "Customers can view purchases of their jobs" ON job_purchases FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_purchases.job_id AND jobs.customer_id = auth.uid())
);
CREATE POLICY "Professionals can purchase jobs" ON job_purchases FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Customers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = customer_id);
