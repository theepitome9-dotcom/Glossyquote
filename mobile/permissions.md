# Permission Model Documentation

**Application:** GLOSSY - Professional Services Marketplace
**Document Date:** 2026-01-05

---

## 1. Role Definitions

### 1.1 User Roles

| Role | Description | Storage Location |
|------|-------------|------------------|
| `customer` | End users seeking professional services | `appStore.userMode`, `appStore.currentCustomer` |
| `professional` | Trade professionals offering services | `appStore.userMode`, `appStore.currentProfessional` |
| `anonymous` | Unauthenticated users (estimate creation) | Default state |

### 1.2 Subscription Tiers (Professionals Only)

| Tier | Description | Benefits |
|------|-------------|----------|
| `free` | Default tier | Standard lead pricing (6 credits) |
| `premium` | Paid subscription | Discounted leads (4 credits), priority placement, premium badge |

---

## 2. Object Definitions

### 2.1 Core Business Objects

| Object | Description | Owner |
|--------|-------------|-------|
| `Professional` | Professional account with credits, portfolio, reviews | Professional (self) |
| `Customer` | Customer profile with contact info, estimates | Customer (self) |
| `Estimate` | Price calculation for a project | Customer (creator) |
| `JobListing` | Posted job for professionals to bid on | Customer (poster) |
| `Review` | Customer review of a professional | Customer (author) |

### 2.2 Object Relationships

```
Customer (1) ----creates----> (N) Estimates
Customer (1) ----posts-----> (N) JobListings
JobListing (1) <--purchases-- (N) Professionals
Professional (1) <--receives-- (N) Reviews
Customer (1) ----writes----> (N) Reviews
```

---

## 3. Permission Matrix

### 3.1 Client-Side Permissions (UI/State)

#### Estimate Operations

| Action | Anonymous | Customer | Professional | Implementation |
|--------|-----------|----------|--------------|----------------|
| Create estimate | YES | YES | NO | `appStore.createEstimate()` |
| View own estimate | YES | YES | NO | `currentEstimate` state |
| View paid estimate | YES | YES | NO | `estimate.paid === true` check |
| Mark as paid | YES | YES | NO | `appStore.markEstimateAsPaid()` |

#### Job Operations

| Action | Anonymous | Customer | Professional | Implementation |
|--------|-----------|----------|--------------|----------------|
| Post job | NO | YES | NO | `addJobListing()` requires customer |
| View job listing | NO | YES (own) | YES (active) | `jobListings` state |
| View job contact info | NO | NO | YES (purchased) | Gated by lead purchase |
| Purchase lead | NO | NO | YES | `purchaseLead()` |

#### Professional Operations

| Action | Anonymous | Customer | Professional | Implementation |
|--------|-----------|----------|--------------|----------------|
| Register | YES | NO | NO | `handleRegister()` |
| Login | NO | NO | YES | `handleLogin()` - email only |
| View dashboard | NO | NO | YES | Navigation guard |
| Purchase credits | NO | NO | YES | RevenueCat integration |
| Add portfolio | NO | NO | YES (self) | `addProfessionalPortfolioItem()` |
| Reply to reviews | NO | NO | YES (self) | `addProfessionalReply()` |

#### Review Operations

| Action | Anonymous | Customer | Professional | Implementation |
|--------|-----------|----------|--------------|----------------|
| View reviews | YES | YES | YES | Public access |
| Create review | NO | YES | NO | `addReview()` |
| Edit review | NO | YES (author) | NO | Not implemented |
| Reply to review | NO | NO | YES (subject) | `addProfessionalReply()` |

---

### 3.2 Database Permissions (Supabase RLS)

#### Source: `supabase-part3-rls-fixed.sql`

##### Profiles Table

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own profile | SELECT | `auth.uid() = id` |
| Professionals are publicly readable | SELECT | `user_type = 'professional'` |
| Users can update own profile | UPDATE | `auth.uid() = id` |
| Users can insert own profile | INSERT | `auth.uid() = id` |

##### Estimates Table (OVERRIDDEN by fix-estimate-rls.sql)

Original policies (disabled):
| Policy | Action | Condition |
|--------|--------|-----------|
| ~~Users can view own estimates~~ | SELECT | `auth.uid() = user_id` |
| ~~Users can create estimates~~ | INSERT | `auth.uid() = user_id` |
| ~~Users can update own estimates~~ | UPDATE | `auth.uid() = user_id` |

**ACTIVE policies from `fix-estimate-rls.sql`:**
| Policy | Action | Condition | RISK |
|--------|--------|-----------|------|
| Anyone can create estimates | INSERT | `TRUE` | HIGH |
| Anyone can view estimates | SELECT | `TRUE` | CRITICAL |
| Service role can update estimates | UPDATE | `TRUE` | CRITICAL |

##### Jobs Table

| Policy | Action | Condition |
|--------|--------|-----------|
| Customers can view own jobs | SELECT | `auth.uid() = customer_id` |
| Professionals can view active jobs | SELECT | `status = 'active' AND user is professional` |
| Customers can create jobs | INSERT | `auth.uid() = customer_id` |
| Customers can update own jobs | UPDATE | `auth.uid() = customer_id` |

##### Job Purchases Table

| Policy | Action | Condition |
|--------|--------|-----------|
| Professionals can view own purchases | SELECT | `auth.uid() = professional_id` |
| Customers can view purchases of their jobs | SELECT | Job belongs to customer |
| Professionals can purchase jobs | INSERT | `auth.uid() = professional_id` |

##### Payments Table

| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own payments | SELECT | `auth.uid() = user_id` |
| Users can create payments | INSERT | `auth.uid() = user_id` |

##### Reviews Table

| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can read reviews | SELECT | `TRUE` (public) |
| Customers can create reviews | INSERT | `auth.uid() = customer_id` |
| Customers can update own reviews | UPDATE | `auth.uid() = customer_id` |

---

## 4. Implementation Details

### 4.1 Client-Side Authorization Guards

**Pattern used in screens:**

```typescript
// src/screens/ProfessionalDashboardScreen.tsx (typical)
const currentProfessional = useAppStore((s) => s.currentProfessional);

if (!currentProfessional) {
  navigation.replace('ProfessionalAuth');
  return null;
}
```

**Screens with guards:**
- `ProfessionalDashboardScreen` - requires `currentProfessional`
- `ProfessionalJobBoardScreen` - requires `currentProfessional`
- `ProfessionalCreditsScreen` - requires `currentProfessional`
- `ProfessionalProfileScreen` - requires `currentProfessional`
- `CustomerProfileScreen` - requires `currentCustomer`

### 4.2 Premium Tier Verification

**Location:** `src/state/appStore.ts:191-197`

```typescript
const leadCost = currentProfessional.isPremium
  ? LEAD_COST_PREMIUM  // 4 credits
  : LEAD_COST_STANDARD; // 6 credits

if (currentProfessional.credits < leadCost) {
  return false; // Insufficient credits
}
```

**Issue:** `isPremium` flag is stored client-side and can be manipulated.

### 4.3 Credit System

**Credit Operations:**

| Operation | Credits | Who Pays |
|-----------|---------|----------|
| Purchase lead (standard) | -6 | Professional |
| Purchase lead (premium) | -4 | Professional |
| Buy credit pack | +N | Professional |

**Implementation:** `src/state/appStore.ts:175-215`

```typescript
purchaseLead: (jobId: string, professionalId: string) => {
  // Check if already purchased
  if (job.interestedProfessionals.includes(professionalId)) return false;

  // Check max professionals
  if (job.interestedProfessionals.length >= job.maxProfessionals) return false;

  // Check credit balance
  if (currentProfessional.credits < leadCost) return false;

  // Deduct credits
  get().updateProfessionalCredits(professionalId, currentProfessional.credits - leadCost);
  return true;
}
```

---

## 5. Permission Gaps & Vulnerabilities

### 5.1 Missing Authorization Checks

| Gap | Description | Risk Level |
|-----|-------------|------------|
| No server-side auth | All auth is client-side only | CRITICAL |
| Estimates publicly readable | Anyone can view all estimate data | CRITICAL |
| Premium status spoofable | `isPremium` stored in local state | HIGH |
| Credit balance client-side | Can be manipulated | HIGH |
| No API authentication | Supabase anon key used for everything | HIGH |

### 5.2 RLS Policy Issues

| Table | Issue | Risk |
|-------|-------|------|
| `estimates` | All policies return TRUE | CRITICAL |
| `profiles` | Professional profiles publicly readable | LOW (intended) |
| `reviews` | All reviews publicly readable | LOW (intended) |

### 5.3 Missing Permissions

| Feature | Missing Permission | Impact |
|---------|-------------------|--------|
| Delete account | Not implemented | GDPR compliance |
| Delete estimate | Not implemented | Data retention |
| Block professional | Not implemented | User safety |
| Report review | Not implemented | Content moderation |

---

## 6. Recommended Permission Model

### 6.1 Proper Role-Based Access Control

```
Roles:
- anonymous: Can create/view own estimates only
- customer: Can manage own profile, jobs, reviews
- professional: Can manage own profile, purchase leads, respond to reviews
- admin: Full system access (not currently implemented)

Objects should be scoped by:
- User ID (auth.uid())
- Organization ID (for future B2B features)
- Resource ownership (creator/owner)
```

### 6.2 Server-Side Enforcement

All permission checks should be duplicated server-side:

1. **Authentication**: JWT-based sessions with Supabase Auth
2. **Authorization**: RLS policies based on `auth.uid()`
3. **Business Logic**: Edge Functions for credit transactions
4. **Audit Trail**: Log all permission-relevant actions

### 6.3 Fixed RLS Policies for Estimates

```sql
-- Proper estimate policies
CREATE POLICY "Users can view own estimates"
  ON estimates FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL AND id = current_setting('app.estimate_id', true)::uuid);

CREATE POLICY "Users can create estimates"
  ON estimates FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Only service role can update estimates"
  ON estimates FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');
```

---

## 7. Appendix: Code References

### Authorization-Related Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/state/appStore.ts` | 30-31 | User mode (customer/professional) |
| `src/state/appStore.ts` | 175-215 | Lead purchase authorization |
| `src/screens/ProfessionalAuthScreen.tsx` | 31-48 | Login flow |
| `src/screens/ProfessionalAuthScreen.tsx` | 50-94 | Registration flow |
| `supabase-part3-rls-fixed.sql` | 1-56 | Database RLS policies |
| `fix-estimate-rls.sql` | 1-30 | Estimate RLS override (VULNERABLE) |

---

*Document generated: 2026-01-05*
