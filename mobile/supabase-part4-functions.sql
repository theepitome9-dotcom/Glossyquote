CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE professional_id = NEW.professional_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE professional_id = NEW.professional_id)
  WHERE id = NEW.professional_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_professional_rating();

CREATE OR REPLACE FUNCTION increment_job_interested_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET interested_count = interested_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_job_purchase ON job_purchases;
CREATE TRIGGER on_job_purchase AFTER INSERT ON job_purchases
  FOR EACH ROW EXECUTE FUNCTION increment_job_interested_count();

CREATE OR REPLACE FUNCTION deduct_credits_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT credits FROM profiles WHERE id = NEW.professional_id) < NEW.credits_spent THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  UPDATE profiles SET credits = credits - NEW.credits_spent WHERE id = NEW.professional_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_job_purchase_deduct_credits ON job_purchases;
CREATE TRIGGER on_job_purchase_deduct_credits BEFORE INSERT ON job_purchases
  FOR EACH ROW EXECUTE FUNCTION deduct_credits_on_purchase();
