const fs = require('fs');
const path = require('path');

// Template environment variables (replace with your actual values)
const envVars = `# Database
POSTGRES_URL="postgres://postgres.xxx:password@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_USER="postgres"
POSTGRES_HOST="db.xxx.supabase.co"
SUPABASE_JWT_SECRET="your_jwt_secret_here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"
POSTGRES_PRISMA_URL="postgres://postgres.xxx:password@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_PASSWORD="your_password_here"
POSTGRES_DATABASE="postgres"
SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
POSTGRES_URL_NON_POOLING="postgres://postgres.xxx:password@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Add DATABASE_URL for compatibility (same as POSTGRES_PRISMA_URL)
DATABASE_URL="postgres://postgres.xxx:password@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
`;

// Write to .env.local
const envLocalPath = path.join(__dirname, '../.env.local');
fs.writeFileSync(envLocalPath, envVars);
console.log('✅ Created .env.local with template environment variables');
console.log('⚠️  IMPORTANT: Replace the placeholder values with your actual Supabase credentials!');

// Also create .env for compatibility
const envPath = path.join(__dirname, '../.env');
fs.writeFileSync(envPath, envVars);
console.log('✅ Created .env with template environment variables');

console.log('\n📝 Next steps:');
console.log('1. Edit .env.local and .env files with your actual Supabase credentials');
console.log('2. Make sure these variables are set in your Vercel dashboard');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npx prisma migrate deploy');
console.log('5. Deploy your application');
