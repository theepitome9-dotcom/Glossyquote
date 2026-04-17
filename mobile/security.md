# Security Audit Report

**Application:** GLOSSY - Professional Services Marketplace
**Audit Date:** 2026-01-05
**Auditor:** Automated Security Analysis

---

## Executive Summary

This document provides a comprehensive security audit of the GLOSSY mobile application codebase. The application is a React Native/Expo marketplace connecting customers with trade professionals (painters, plasterers, flooring contractors).

### Risk Level: **MEDIUM-HIGH**

The application has several critical security gaps, particularly around authentication, authorization, and data protection. Immediate remediation is recommended for production deployments.

---

## 1. Authentication Audit

### 1.1 Current Implementation

**Location:** `src/screens/ProfessionalAuthScreen.tsx`, `src/state/appStore.ts`

| Aspect | Status | Risk |
|--------|--------|------|
| Password Authentication | NOT IMPLEMENTED | CRITICAL |
| Email Verification | NOT IMPLEMENTED | HIGH |
| Session Management | Client-side only (AsyncStorage) | HIGH |
| Multi-Factor Auth | NOT IMPLEMENTED | MEDIUM |
| Session Timeout | NOT IMPLEMENTED | MEDIUM |
| Account Lockout | NOT IMPLEMENTED | MEDIUM |

### 1.2 Authentication Flow Analysis

**Professional Login (Lines 31-48 of ProfessionalAuthScreen.tsx):**
```typescript
const handleLogin = () => {
  // Only email check - NO PASSWORD VERIFICATION
  const professional = professionals.find(
    (p) => p.email.toLowerCase() === email.toLowerCase().trim()
  );
  if (professional) {
    setCurrentProfessional(professional);
    navigation.replace('ProfessionalDashboard');
  }
};
```

**CRITICAL VULNERABILITY:** Login only requires knowing an email address. No password, no token verification, no server-side validation.

### 1.3 Session Storage

**Location:** `src/state/appStore.ts` (Lines 340-351)

Sessions are persisted using:
- `AsyncStorage` via Zustand middleware
- Storage key: `'glossy-storage'`
- No encryption of stored data
- No session expiration mechanism

**Risk:** Device theft exposes all user data. AsyncStorage is unencrypted on most mobile platforms.

### 1.4 Findings

| ID | Finding | Severity | Location |
|----|---------|----------|----------|
| AUTH-001 | No password authentication | CRITICAL | ProfessionalAuthScreen.tsx:31-48 |
| AUTH-002 | Email-only login allows impersonation | CRITICAL | ProfessionalAuthScreen.tsx:38-43 |
| AUTH-003 | No email verification on registration | HIGH | ProfessionalAuthScreen.tsx:50-94 |
| AUTH-004 | Session stored unencrypted | HIGH | appStore.ts:340-351 |
| AUTH-005 | No session timeout/expiration | MEDIUM | appStore.ts |
| AUTH-006 | No account lockout after failed attempts | MEDIUM | ProfessionalAuthScreen.tsx |
| AUTH-007 | User IDs are predictable (Date.now()) | MEDIUM | ProfessionalAuthScreen.tsx:102 |

---

## 2. Authorization Audit

### 2.1 Current Implementation

Authorization relies on:
1. **Client-side state checks** in React components
2. **Supabase Row Level Security (RLS)** for database access
3. **Premium status flags** stored in local state

### 2.2 Client-Side Authorization Gaps

**Professional Dashboard Guard (typical pattern):**
```typescript
if (!currentProfessional) {
  navigation.replace('ProfessionalAuth');
  return null;
}
```

**Issue:** These are UI-only guards. A malicious client can bypass by directly manipulating state or API calls.

### 2.3 Database RLS Policies

**Location:** `supabase-part3-rls-fixed.sql`, `fix-estimate-rls.sql`

**CRITICAL ISSUE in fix-estimate-rls.sql (Lines 9-29):**
```sql
CREATE POLICY "Anyone can create estimates"
  ON estimates FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can view estimates"
  ON estimates FOR SELECT USING (TRUE);

CREATE POLICY "Service role can update estimates"
  ON estimates FOR UPDATE USING (TRUE);
```

This completely disables access control on the `estimates` table:
- Anyone can create estimates (no user association)
- Anyone can view ALL estimates (privacy breach)
- Anyone can update ANY estimate (data tampering)

### 2.4 Findings

| ID | Finding | Severity | Location |
|----|---------|----------|----------|
| AUTHZ-001 | Estimates table has no access control | CRITICAL | fix-estimate-rls.sql |
| AUTHZ-002 | Client-side navigation guards only | HIGH | Multiple screens |
| AUTHZ-003 | Premium status stored client-side (spoofable) | HIGH | appStore.ts |
| AUTHZ-004 | Credit balance validated client-side only | HIGH | appStore.ts:191-197 |
| AUTHZ-005 | No server-side role verification | HIGH | All API calls |

---

## 3. Secrets Management Audit

### 3.1 Environment Variables

**Location:** `.env`

**Currently Exposed in Client Bundle:**

| Secret | Type | Exposure Risk |
|--------|------|---------------|
| `EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY` | API Key | HIGH - Allows unauthorized AI usage |
| `EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY` | API Key | HIGH - Allows unauthorized AI usage |
| `EXPO_PUBLIC_VIBECODE_GROK_API_KEY` | API Key | HIGH - Allows unauthorized AI usage |
| `EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY` | API Key | HIGH - Allows unauthorized Google API usage |
| `EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY` | API Key | HIGH - Allows unauthorized voice generation |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | JWT Token | LOW - Expected (protected by RLS) |
| `EXPO_PUBLIC_VIBECODE_REVENUECAT_TEST_KEY` | SDK Key | LOW - Expected for mobile SDKs |
| `EXPO_PUBLIC_VIBECODE_REVENUECAT_APPLE_KEY` | SDK Key | LOW - Expected for mobile SDKs |

**CRITICAL:** All `EXPO_PUBLIC_*` variables are bundled into the client app and can be extracted by decompiling the APK/IPA.

### 3.2 Properly Secured (Backend Only)

According to `.env` comments, these are stored in Supabase Secrets:
- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

### 3.3 Historical Leak

**IMPORTANT:** The `.env` file contains a comment (Lines 20-24) showing the `SUPABASE_SERVICE_ROLE_KEY` was previously exposed:
```
# Original value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This key should be rotated immediately if it hasn't been already.

### 3.4 Findings

| ID | Finding | Severity | Location |
|----|---------|----------|----------|
| SEC-001 | AI API keys exposed in client bundle | HIGH | .env |
| SEC-002 | Historical service role key in comments | HIGH | .env:22 |
| SEC-003 | No key rotation policy documented | MEDIUM | N/A |
| SEC-004 | Keys not encrypted at rest | MEDIUM | .env |

---

## 4. Data Protection Audit

### 4.1 Sensitive Data Inventory

| Data Type | Storage Location | Encryption | Risk |
|-----------|------------------|------------|------|
| Professional email | AsyncStorage, Supabase | None | HIGH |
| Professional phone | AsyncStorage, Supabase | None | HIGH |
| Customer email | AsyncStorage, Supabase | None | HIGH |
| Customer phone | AsyncStorage, Supabase | None | HIGH |
| Payment data | RevenueCat (external) | Yes | LOW |
| Estimate pricing | AsyncStorage, Supabase | None | MEDIUM |
| Job descriptions | AsyncStorage, Supabase | None | LOW |

### 4.2 Data Transmission

- All API calls use HTTPS (enforced by Supabase)
- No certificate pinning implemented
- No request signing or integrity verification

### 4.3 Data at Rest

**AsyncStorage (appStore.ts Lines 343-349):**
```typescript
partialize: (state): PersistedState => ({
  isDarkMode: state.isDarkMode,
  locale: state.locale,
  jobListings: state.jobListings,  // Contains customer PII
  professionals: state.professionals, // Contains professional PII
});
```

**Issue:** Job listings contain customer contact information stored unencrypted.

### 4.4 Findings

| ID | Finding | Severity | Location |
|----|---------|----------|----------|
| DATA-001 | PII stored unencrypted in AsyncStorage | HIGH | appStore.ts |
| DATA-002 | No certificate pinning | MEDIUM | All API clients |
| DATA-003 | Job listings expose customer PII | HIGH | appStore.ts:347 |
| DATA-004 | No data retention/deletion policy | MEDIUM | N/A |

---

## 5. Payment Security Audit

### 5.1 Payment Flow

1. RevenueCat handles in-app purchases (secure)
2. Stripe handles web payments via Supabase Edge Functions (secure)
3. Manual payment workaround exists (INSECURE)

### 5.2 Critical Payment Bypass

**Location:** `src/api/supabase.ts` (Lines 248-294, 301-408)

```typescript
export async function manuallyMarkEstimateAsPaid(estimateId: string)
export async function findAndMarkRecentEstimateAsPaid(totalMinPrice, totalMaxPrice)
```

These functions allow marking estimates as paid WITHOUT payment verification:
- `manuallyMarkEstimateAsPaid`: Marks any estimate as paid by ID
- `findAndMarkRecentEstimateAsPaid`: Marks estimates matching price range as paid

**Combined with open RLS policies, anyone can:**
1. View all estimates in the system
2. Mark any estimate as paid
3. Access paid content without payment

### 5.3 Findings

| ID | Finding | Severity | Location |
|----|---------|----------|----------|
| PAY-001 | Manual payment bypass functions | CRITICAL | supabase.ts:248-408 |
| PAY-002 | No payment verification before marking paid | CRITICAL | supabase.ts:263-269 |
| PAY-003 | Price matching allows wrong estimate marking | HIGH | supabase.ts:341-373 |

---

## 6. Third-Party Integration Security

### 6.1 Supabase

- Uses anonymous key (correct)
- RLS policies partially implemented
- Service role key properly secured in backend

### 6.2 RevenueCat

- SDK properly initialized
- Keys are platform-specific (correct)
- Web platform correctly disabled

### 6.3 AI APIs (OpenAI, Anthropic, Grok)

**Location:** `src/api/openai.ts`, `src/api/anthropic.ts`, `src/api/grok.ts`, `src/api/chat-service.ts`

- API keys exposed in client bundle
- No rate limiting
- No usage monitoring
- Potential for abuse/cost exploitation

---

## 7. Recommendations Summary

### Critical (Fix Immediately)

1. **Implement proper authentication** - Add password hashing, server-side session management
2. **Fix RLS policies on estimates** - Remove `TRUE` policies, implement proper user-based access
3. **Remove manual payment bypass** - Or add proper verification
4. **Move AI API keys to backend** - Proxy AI requests through secure backend

### High Priority (Fix Within 2 Weeks)

5. **Encrypt AsyncStorage data** - Use expo-secure-store for sensitive data
6. **Add email verification** - Verify email on registration
7. **Implement session timeouts** - Auto-logout after inactivity
8. **Remove leaked service key from comments** - And rotate the key

### Medium Priority (Fix Within 1 Month)

9. **Add certificate pinning** - Prevent MITM attacks
10. **Implement rate limiting** - Prevent abuse
11. **Add audit logging** - Track security-relevant events
12. **Create data retention policy** - GDPR compliance

---

## 8. Appendix: File Inventory

### Security-Relevant Files

| File | Purpose | Risk Areas |
|------|---------|------------|
| `src/screens/ProfessionalAuthScreen.tsx` | Professional login/registration | AUTH-001 to AUTH-007 |
| `src/state/appStore.ts` | State management & persistence | DATA-001, DATA-003, AUTHZ-003-004 |
| `src/api/supabase.ts` | Database & payment API | PAY-001 to PAY-003 |
| `supabase-part3-rls-fixed.sql` | RLS policies | Baseline policies |
| `fix-estimate-rls.sql` | RLS override | AUTHZ-001 |
| `.env` | Environment variables | SEC-001 to SEC-004 |
| `src/lib/revenuecatClient.ts` | Payment SDK | Properly secured |
| `src/utils/profanity-filter.ts` | Input validation | Partial coverage |

---

*Report generated: 2026-01-05*

---

## 9. Remediation Status

The following security issues have been addressed:

### Fixed Issues

| ID | Issue | Fix Applied | Location |
|----|-------|-------------|----------|
| PAY-001 | Manual payment bypass functions | Functions now return errors, disabled for security | `src/api/supabase.ts` |
| PAY-002 | No payment verification | Manual bypass disabled | `src/api/supabase.ts` |
| PAY-003 | Price matching bypass | Function disabled | `src/api/supabase.ts` |
| LOG-001 | Sensitive data in console logs | All logs wrapped with `__DEV__` | Multiple files |
| INJ-001 | AI prompt injection risk | Added `sanitizeForAI()` validation | `src/utils/ai-room-measurement.ts` |

### New Security Utilities Added

1. **Input Validation** (`src/utils/validation.ts`)
   - UK postcode validation
   - Email/phone validation
   - Room dimension bounds checking
   - Image URI validation
   - AI prompt sanitization with injection prevention

2. **Secure Storage** (`src/utils/security.ts`)
   - Expo SecureStore wrappers
   - Secure token generation
   - SHA-256 hashing
   - Session management
   - Privacy consent tracking

### Files Modified

- `src/api/supabase.ts` - Disabled payment bypass functions
- `src/screens/PaymentSelectionScreen.tsx` - Wrapped logs with `__DEV__`
- `src/screens/EstimateResultScreen.tsx` - Wrapped logs with `__DEV__`
- `src/screens/CostTrackingScreen.tsx` - Wrapped logs with `__DEV__`
- `src/screens/ProfessionalCreditsScreen.tsx` - Wrapped logs with `__DEV__`, fixed React hooks order
- `src/utils/ai-room-measurement.ts` - Added input validation and prompt sanitization

### Remaining Issues

The following issues from the original audit still require attention:

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| AUTH-001 | No password authentication | OPEN | Requires backend implementation |
| AUTH-002 | Email-only login | OPEN | Requires backend authentication |
| AUTH-003 | No email verification | OPEN | Requires backend implementation |
| AUTH-004 | Session stored unencrypted | PARTIAL | SecureStore utilities added, migration needed |
| AUTHZ-001 | Estimates table RLS | OPEN | Requires database changes |
| SEC-001 | AI API keys in client | OPEN | Requires backend proxy |
| DATA-001 | PII in AsyncStorage | PARTIAL | SecureStore utilities added |

---

## 10. Security Best Practices

### For Developers

1. **Never log sensitive data in production**
   ```typescript
   // WRONG
   console.log('User payment:', paymentDetails);

   // CORRECT
   if (__DEV__) {
     console.log('Payment processing started');
   }
   ```

2. **Always validate user input**
   ```typescript
   import { validateEmail, validatePostcode } from '../utils/validation';

   const result = validateEmail(userInput);
   if (!result.isValid) {
     showError(result.error);
     return;
   }
   ```

3. **Sanitize data before AI calls**
   ```typescript
   import { sanitizeForAI } from '../utils/validation';

   const sanitizedInput = sanitizeForAI(userInput, 500);
   ```

4. **Use secure storage for sensitive data**
   ```typescript
   import { secureSet, secureGet } from '../utils/security';

   await secureSet('auth_token', token);
   const token = await secureGet('auth_token');
   ```

5. **Never trust client-side payment state**
   - Always verify payments server-side through webhooks
   - Don't use client-provided payment status for access control

---

*Last updated: 2026-01-05*
