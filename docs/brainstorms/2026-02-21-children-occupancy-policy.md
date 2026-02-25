# Occupancy Check Policy — Fully Confirmed

**Date:** 2026-02-21  
**Status:** ✅ All decisions confirmed — Ready for Implementation

---

## Confirmed Policy

### 1. Who Is an Adult?
Anyone **age 10 and above** is treated as an adult and counted toward the room's `max_occupancy`.

### 2. Who Is a Child?
Anyone **under age 10** is treated as a child — free of charge and **not counted toward `max_occupancy`**. There is no limit on the number of children in this age group.

> The booking form will not collect individual child ages. `numChildren` is entered as a count by the admin/guest, and it is trusted to represent guests under age 10.

### 3. Max Occupancy Check (Adults Only)
The room's `max_occupancy` applies to adults only.

> `numAdults ≤ maxOccupancy` → Normal booking  
> `numAdults = maxOccupancy + 1` → Allowed with extra adult charge  
> `numAdults ≥ maxOccupancy + 2` → Blocked — must book an extra room

### 4. One Extra Adult Rule
If the number of adults **exceeds `max_occupancy` by exactly 1**, the booking is allowed but an **extra adult charge + 5% tax** is added to the total.

- The extra adult charge is a **flat amount configured per room type**
- Default value: **₹1,000**
- Tax on extra adult charge: **5%**

### 5. Two or More Extra Adults
If adults exceed `max_occupancy` by **2 or more**, the booking is blocked. The guest must book an additional room.

---

## Summary Table

| Scenario | Adults | Children (under 10) | Outcome |
|----------|--------|----------------------|---------|
| Within capacity | ≤ maxOccupancy | Any number | ✅ Normal booking |
| One extra adult | maxOccupancy + 1 | Any number | ✅ Allowed + extra charge + 5% tax |
| Two or more extra | ≥ maxOccupancy + 2 | Any number | ❌ Blocked — book extra room |

---

## Example (Room maxOccupancy = 2, extra adult charge = ₹1,000)

| Guests | Result |
|--------|--------|
| 2 adults + 5 children | ✅ Normal booking |
| 3 adults + 10 children | ✅ Allowed + ₹1,000 + ₹50 tax = ₹1,050 extra |
| 4 adults + 2 children | ❌ Blocked — book an extra room |

---

## What Needs to Be Built

### Database / Schema
- [ ] Add `extraAdultChargeCents` field on `room_type` (flat amount, default `100000` = ₹1,000)

### Backend
- [ ] Enforce occupancy validation on booking create/edit:
  - `numAdults ≤ maxOccupancy` → proceed normally
  - `numAdults = maxOccupancy + 1` → add extra adult charge + 5% tax to total
  - `numAdults ≥ maxOccupancy + 2` → return validation error
- [ ] Include extra adult charge and its tax as separate line items in the booking amount breakdown

### Frontend — Room Type Form
- [ ] Add `Extra Adult Charge` field (number input, default ₹1,000) when creating/editing a room type

### Frontend — Booking Form
- [ ] When +1 extra adult is detected, show a notice: *"One extra adult will be charged ₹X + 5% tax"*
- [ ] When adults exceed max by 2+, show a blocking error: *"Maximum occupancy exceeded. Please book an additional room."*
- [ ] Add helper text on `numChildren` field: *"Enter count of guests under age 10. Children are free and do not affect room capacity."*
