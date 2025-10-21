# Database Migration Cutover Guide
## Supabase → Neon

### ✅ Migration Status: **COMPLETED**

All data has been successfully migrated from Supabase to Neon:
- **5 clients** ✓
- **19 invoices** ✓
- **23 invoice items** ✓
- **70 expenses** ✓
- **0 bank imports** ✓
- **0 bank transactions** ✓

---

## Testing Instructions

### Step 1: Test with Neon Database

To test the application with the new Neon database **without changing code**, temporarily update your `.env.local`:

```bash
# Comment out or temporarily rename the old variable
# POSTGRES_PRISMA_URL="postgres://postgres.xkphfigqbmhgaxkbivip:..."

# Rename NEON_DATABASE_URL to POSTGRES_PRISMA_URL
POSTGRES_PRISMA_URL="postgresql://neondb_owner:npg_sZcoli5rf6ut@ep-morning-base-aevlfu1a-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Step 2: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 3: Test All Features

Test the following to ensure everything works:

- [ ] **Login** - Can you authenticate?
- [ ] **Clients**
  - [ ] View clients list
  - [ ] View individual client details
  - [ ] Create new client
  - [ ] Edit existing client
- [ ] **Invoices**
  - [ ] View invoices list
  - [ ] View individual invoice
  - [ ] Create new invoice
  - [ ] Edit invoice
  - [ ] Change invoice status
  - [ ] Generate PDF
  - [ ] Send invoice email
- [ ] **Expenses**
  - [ ] View expenses list
  - [ ] Create new expense
  - [ ] Edit expense
  - [ ] Delete expense
- [ ] **Dashboard**
  - [ ] View stats/analytics
  - [ ] Check all numbers match expected values
- [ ] **Cross-platform sync** (Pusher)
  - [ ] Open site on two devices
  - [ ] Make a change on one
  - [ ] Verify it appears on the other

---

## Final Cutover Steps

Once you're confident everything works:

### 1. Update `.env.local` (Permanent Change)

**Option A - Clean approach (recommended):**
```bash
# Remove or comment out all old Supabase variables
# POSTGRES_URL=...
# POSTGRES_USER=...
# SUPABASE_URL=...
# etc.

# Set POSTGRES_PRISMA_URL to Neon
POSTGRES_PRISMA_URL="postgresql://neondb_owner:npg_sZcoli5rf6ut@ep-morning-base-aevlfu1a-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Also update DATABASE_URL to match
DATABASE_URL="postgresql://neondb_owner:npg_sZcoli5rf6ut@ep-morning-base-aevlfu1a-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Option B - Keep backup variables:**
```bash
# Rename old Supabase variables with _BACKUP suffix
POSTGRES_PRISMA_URL_BACKUP="postgres://postgres.xkphfigqbmhgaxkbivip:..."
POSTGRES_URL_BACKUP="postgres://postgres.xkphfigqbmhgaxkbivip:..."

# Set primary variables to Neon
POSTGRES_PRISMA_URL="postgresql://neondb_owner:npg_sZcoli5rf6ut@ep-morning-base-aevlfu1a-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL="postgresql://neondb_owner:npg_sZcoli5rf6ut@ep-morning-base-aevlfu1a-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 2. Update Production Environment

If you're using Vercel or another hosting platform:

1. Go to your project settings
2. Update environment variables:
   - `POSTGRES_PRISMA_URL` → Your Neon URL
   - `DATABASE_URL` → Your Neon URL
3. Redeploy the application

### 3. Monitor for Issues

After cutover:
- Monitor for any errors in production
- Check Neon dashboard for query performance
- Verify all Pusher sync functionality works
- Test on both desktop and mobile devices

### 4. Backup Strategy

**Keep Supabase active for 7-14 days** as a backup:
- Don't delete the Supabase database immediately
- If issues arise, you can quickly roll back
- After the retention period, you can safely decommission Supabase

---

## Rollback Procedure (If Needed)

If you encounter issues and need to roll back:

1. **Update `.env.local`:**
   ```bash
   POSTGRES_PRISMA_URL="postgres://postgres.xkphfigqbmhgaxkbivip:9aPOcyUZZYpoObJM@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
   DATABASE_URL="postgres://postgres.xkphfigqbmhgaxkbivip:9aPOcyUZZYpoObJM@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
   ```

2. **Restart server:**
   ```bash
   npm run dev
   ```

3. **If data was added to Neon during testing**, you may need to sync it back to Supabase (or accept the loss if it was test data)

---

## Re-running Migration (If Needed)

If you need to re-run the migration (e.g., to sync new data):

```bash
node scripts/migrate-to-neon.js
```

The script uses `upsert`, so it will safely update existing records and add new ones.

---

## Why This Migration Strategy is Good

Your instinct was correct! This approach provides:

1. ✅ **Zero code changes** - Just environment variable updates
2. ✅ **Easy testing** - Switch variables to test, no code deployment needed
3. ✅ **Quick rollback** - Just change variables back
4. ✅ **Safe migration** - Old database stays intact as backup
5. ✅ **Verification built-in** - Script confirms all data copied correctly
6. ✅ **Production ready** - Same process works for production cutover

---

## Notes

- **Connection pooling**: Neon URL already includes pooler, so you're good
- **SSL mode**: Already set to `require` for security
- **Prisma compatibility**: Neon works perfectly with Prisma
- **Performance**: Neon often performs better than Supabase for Postgres workloads
- **Scaling**: Neon has excellent autoscaling capabilities

---

## Questions?

If you encounter any issues during testing or cutover, check:
1. Environment variables are loaded correctly (`console.log(process.env.POSTGRES_PRISMA_URL)`)
2. Application has been restarted after env changes
3. No cached connections to old database
4. Prisma Client has been regenerated if needed (`npx prisma generate`)

