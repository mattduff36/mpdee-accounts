const fs = require('fs');
const path = require('path');

// Your Supabase environment variables
const envVars = `# Database
POSTGRES_URL="postgres://postgres.xkphfigqbmhgaxkbivip:9aPOcyUZZYpoObJM@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_USER="postgres"
POSTGRES_HOST="db.xkphfigqbmhgaxkbivip.supabase.co"
SUPABASE_JWT_SECRET="C6JaBxKrsKwKBtoNc4vATzGt+uko0o7R0inuFD7owU07StYwjZULgGpznnplU1vkvxv3K/w1wABgEuBauIR9RA=="
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcGhmaWdxYm1oZ2F4a2JpdmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODI5MzgsImV4cCI6MjA2OTk1ODkzOH0.ysfYuKuA1lWkCGdnKxj-gIn3YeoCJe5m-8j1dil_SVo"
POSTGRES_PRISMA_URL="postgres://postgres.xkphfigqbmhgaxkbivip:9aPOcyUZZYpoObJM@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_PASSWORD="9aPOcyUZZYpoObJM"
POSTGRES_DATABASE="postgres"
SUPABASE_URL="https://xkphfigqbmhgaxkbivip.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://xkphfigqbmhgaxkbivip.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcGhmaWdxYm1oZ2F4a2JpdmlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM4MjkzOCwiZXhwIjoyMDY5OTU4OTM4fQ.-4XqqwgCk8px36Uw1jQc_JOvqPg874tophi9idCHDSw"
POSTGRES_URL_NON_POOLING="postgres://postgres.xkphfigqbmhgaxkbivip:9aPOcyUZZYpoObJM@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Add DATABASE_URL for compatibility (same as POSTGRES_PRISMA_URL)
DATABASE_URL="postgres://postgres.xkphfigqbmhgaxkbivip:9aPOcyUZZYpoObJM@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
`;

// Write to .env.local
const envLocalPath = path.join(__dirname, '../.env.local');
fs.writeFileSync(envLocalPath, envVars);
console.log('✅ Created .env.local with all environment variables');

// Also create .env for compatibility
const envPath = path.join(__dirname, '../.env');
fs.writeFileSync(envPath, envVars);
console.log('✅ Created .env with all environment variables');

console.log('\n📝 Next steps:');
console.log('1. Make sure these variables are set in your Vercel dashboard');
console.log('2. Run: npx prisma generate');
console.log('3. Run: npx prisma migrate deploy');
console.log('4. Deploy your application');
