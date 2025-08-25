# Database Migration Guide: SQLite to PostgreSQL

## Problem
Your live site is getting 500 errors because it's trying to use SQLite, which doesn't work on Vercel's serverless platform. You need to migrate to a cloud database.

## Solution: Migrate to Vercel Postgres

### Step 1: Set up Vercel Postgres

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Add Postgres to your project**:
   ```bash
   vercel storage add
   ```
   - Select "Postgres" when prompted
   - Follow the setup wizard

4. **Link your project** (if not already linked):
   ```bash
   vercel link
   ```

### Step 2: Update Environment Variables

After setting up Vercel Postgres, you'll get a `DATABASE_URL`. Add this to your Vercel environment variables:

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Add `DATABASE_URL` with the PostgreSQL connection string

### Step 3: Update Local Development

Create a `.env.local` file in your project root:

```env
# For local development with PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/mpdee_accounts"

# For local development with SQLite (fallback)
# DATABASE_URL="file:./dev.db"
```

### Step 4: Install PostgreSQL Dependencies

```bash
npm install pg @types/pg
```

### Step 5: Generate and Run Prisma Migrations

1. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

2. **Create migration for PostgreSQL**:
   ```bash
   npx prisma migrate dev --name migrate-to-postgres
   ```

3. **Deploy migration to production**:
   ```bash
   npx prisma migrate deploy
   ```

### Step 6: Migrate Your Data (Optional)

If you have existing data in your SQLite database that you want to preserve:

1. **Install SQLite dependency temporarily**:
   ```bash
   npm install sqlite3
   ```

2. **Run the migration script**:
   ```bash
   node scripts/migrate-to-postgres.js
   ```

3. **Remove SQLite dependency**:
   ```bash
   npm uninstall sqlite3
   ```

### Step 7: Test Your Application

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## Alternative Solutions

### Option 2: Use Supabase (Free Tier Available)

If you prefer not to use Vercel Postgres:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings → Database
4. Update your `DATABASE_URL` environment variable
5. Follow the same migration steps above

### Option 3: Use PlanetScale (Free Tier Available)

1. Create a free account at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get your connection string
4. Update your `DATABASE_URL` environment variable
5. Follow the same migration steps above

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Make sure your `DATABASE_URL` is correct and the database is accessible
2. **Migration Errors**: Run `npx prisma migrate reset` to start fresh
3. **Environment Variables**: Ensure `DATABASE_URL` is set in Vercel dashboard

### Verification Commands

```bash
# Check database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio

# Check migration status
npx prisma migrate status
```

## Cost Considerations

- **Vercel Postgres**: Starts at $20/month for production use
- **Supabase**: Free tier includes 500MB database
- **PlanetScale**: Free tier includes 1GB database

For a small business application, the free tiers should be sufficient to start with.

## Next Steps

After migration:

1. Test all API endpoints
2. Verify data integrity
3. Update your deployment pipeline
4. Monitor database performance
5. Set up database backups

## Support

If you encounter issues during migration:

1. Check the Prisma documentation: https://www.prisma.io/docs
2. Review Vercel Postgres docs: https://vercel.com/docs/storage/vercel-postgres
3. Check your application logs in Vercel dashboard
