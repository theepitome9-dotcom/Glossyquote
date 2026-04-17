# Room-Based Pricing Update

## Fixed Estimate Payment Pricing

### Issue
Previously, when customers added multiple rooms in "Detailed Entry" mode, the payment price wasn't scaling correctly with the number of rooms. It was jumping directly to £10 for 2+ rooms.

### Solution
Updated the `getEstimatePriceTier()` function to properly scale pricing based on the number of rooms:

| Number of Rooms | Price |
|----------------|-------|
| 1 room         | £2    |
| 2 rooms        | £4    |
| 3 rooms        | £6    |
| 4 rooms        | £8    |
| 5+ rooms       | £10   |

### Technical Details

**File Modified:** `src/utils/estimate-calculator.ts`

**Function:** `getEstimatePriceTier()`

The function now checks the room count directly and returns the appropriate price:
- Simple, transparent pricing: £2 per room
- Caps at £10 for 5+ rooms
- Works for both "Quick Quote" and "Detailed Entry" modes

### User Experience

**Before:**
- 1 room: £2 ✓
- 2 rooms: £10 ✗ (too expensive)
- 3 rooms: £10 ✗

**After:**
- 1 room: £2 ✓
- 2 rooms: £4 ✓
- 3 rooms: £6 ✓
- 4 rooms: £8 ✓
- 5+ rooms: £10 ✓

### Testing

To test the fix:
1. Open the app
2. Go to "Get Estimate"
3. Select "Detailed Entry" mode
4. Enter measurements for 1 room → Should see £2
5. Add a second room → Should see £4
6. Add a third room → Should see £6
7. Add a fourth room → Should see £8

The payment screen will now show the correct price based on the actual number of rooms entered.

---

**Status:** ✅ Fixed and deployed
**Date:** October 12, 2025
