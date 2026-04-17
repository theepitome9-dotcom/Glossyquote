# 🧪 Test Payment Verification System

## Quick Test Steps

### 1. Make Sure Webhook is Deployed

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

### 2. Test the Flow

**In your app:**
1. Fill in estimate form (e.g., 1 room, 3m x 2m)
2. Click "Pay £2 with Card"
3. Complete payment in browser:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/28`
   - CVC: `123`
   - Email: YOUR REAL EMAIL
4. After payment confirmation, return to app
5. Click "I Completed Payment"
6. **Wait 5-10 seconds** - you'll see "Verifying Payment..."
7. Should show "Payment Verified!" ✅
8. Estimate appears with full details

### 3. Test Failure Case

1. Start payment flow
2. **Close browser** without paying
3. Return to app
4. Click "I Completed Payment"
5. Should show "Payment Not Verified" ❌
6. Estimate does NOT appear

---

## ✅ What Success Looks Like

- Payment completes in Stripe ✓
- Webhook fires within 5 seconds ✓
- Database updates to `paid: true` ✓
- App verifies payment ✓
- Estimate shows ✓
- Email receipt arrives ✓

## ❌ If Something Goes Wrong

### Webhook Not Firing:
- Check: https://dashboard.stripe.com/webhooks
- Verify endpoint URL is correct
- Check "Recent deliveries" tab

### Database Not Updating:
- Check Supabase logs
- Run: `supabase functions logs stripe-webhook`
- Look for errors

### App Can't Verify:
- Check network connection
- Verify SUPABASE_URL and ANON_KEY in .env
- Check database has estimates table

---

**Try it now and let me know the result!** 🚀
