# 4-Room Maximum Limit for Detailed Entry

## Update Summary

Detailed Entry mode now has a **maximum of 4 rooms**. This ensures customers use the appropriate mode for their property size and keeps the pricing simple and transparent.

---

## Changes Made

### 1. Maximum Room Limit
- **Detailed Entry:** Now capped at 4 rooms maximum
- **Quick Quote:** No limit (handles properties up to 5+ bedrooms)

### 2. User Experience

#### When at Maximum (4 rooms)
- "Add Room" button becomes disabled (gray)
- Button text changes to "Add Room (Max 4)"
- If user taps it, shows friendly alert:
  > "Detailed Entry mode supports up to 4 rooms. For larger properties, please use Quick Quote mode or contact us directly."

#### Visual Feedback
- **Normal state:** Blue "Add Room" button
- **At max (4 rooms):** Gray "Add Room (Max 4)" button (disabled)

### 3. Pricing Structure (Unchanged)

| Rooms | Price | Mode |
|-------|-------|------|
| 1 room | £2 | Detailed Entry |
| 2 rooms | £4 | Detailed Entry |
| 3 rooms | £6 | Detailed Entry |
| 4 rooms | £8 | Detailed Entry (MAX) |
| 5+ rooms | Use Quick Quote | £10-£20 packages |

---

## Why This Limit?

### 1. **Encourages Correct Mode Usage**
   - Detailed Entry is best for small/specific jobs (1-4 rooms)
   - Quick Quote is better for whole properties (5+ bedrooms)

### 2. **Simplifies Pricing**
   - Clear progression: £2, £4, £6, £8
   - No confusion about 5+ room pricing in Detailed Entry

### 3. **Better User Experience**
   - Prevents tedious data entry for large properties
   - Guides users to faster Quick Quote option

### 4. **Matches Real-World Usage**
   - Most room-by-room estimates are for 1-4 rooms
   - Whole house jobs typically use Quick Quote

---

## Files Modified

**`src/screens/CustomerEstimateScreen.tsx`**
- Added check in `addRoom()` function to prevent exceeding 4 rooms
- Shows alert when limit reached
- Updated "Add Room" button to show disabled state at max
- Button text changes to "Add Room (Max 4)" when at limit

**`src/utils/estimate-calculator.ts`**
- Already correctly handles pricing for 1-4 rooms
- Has fallback for 5+ (though now prevented in UI)

**`src/config/payments.ts`**
- Already correctly maps 4+ rooms to £8 payment link
- Works perfectly with the new limit

---

## User Flow Example

### Scenario: Customer with 5 rooms

**Before (Unlimited):**
1. Add Room 1, 2, 3, 4, 5
2. Fill in all measurements manually
3. Pay £10 (or higher)

**After (4-room limit):**
1. Add Room 1, 2, 3, 4
2. Try to add Room 5 → Alert appears
3. Alert suggests: "For larger properties, use Quick Quote mode"
4. User switches to Quick Quote
5. Selects "3 Bed House with Stairs" or similar
6. Faster checkout, appropriate pricing (£10-£20)

---

## Quick Quote Packages (For 5+ Rooms)

When users hit the 4-room limit, they should use Quick Quote:

| Package | Rooms | Price |
|---------|-------|-------|
| 3 Bed Flat (Single) | Multiple | £10 |
| 1 Bed F/H with Stairs | Multiple | £12 |
| 2 Bed F/H with Stairs | Multiple | £14 |
| 3 Bed F/H with Stairs | Multiple | £16 |
| 4 Bed F/H with Stairs | Multiple | £18 |
| 5 Bed F/H with Stairs | Multiple | £20 |

---

## Testing Checklist

- [ ] Open app, go to "Get Estimate"
- [ ] Select "Detailed Entry" mode
- [ ] Add Room 1 → Success ✓
- [ ] Add Room 2 → Success ✓
- [ ] Add Room 3 → Success ✓
- [ ] Add Room 4 → Success ✓
- [ ] Button shows "Add Room (Max 4)" and is gray
- [ ] Try to add Room 5 → Alert appears with message
- [ ] Alert recommends Quick Quote mode
- [ ] Continue with 4 rooms → Payment shows £8
- [ ] Switch to Quick Quote mode → Can select 5+ bed packages

---

## Benefits

### For Customers
✅ Clear guidance on which mode to use  
✅ Prevents tedious data entry for large properties  
✅ Faster checkout with Quick Quote for big jobs  
✅ Appropriate pricing for property size  

### For You (Business)
✅ Encourages use of Quick Quote for larger jobs  
✅ Better pricing accuracy (property packages vs. room count)  
✅ Reduces data entry errors  
✅ Clearer customer segmentation  

---

**Status:** ✅ 4-room limit implemented and active  
**Date:** October 12, 2025  
**Impact:** Improves UX and guides customers to appropriate pricing mode
