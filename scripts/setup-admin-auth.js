const fs = require('fs');
const path = require('path');

// Admin authentication environment variables
const adminAuthVars = `# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Q-0ww9qe?!?

# JWT Secret (for session management)
NEXTAUTH_SECRET=your-secret-key-here

# Database (already set in production)
POSTGRES_PRISMA_URL=postgres://postgres.xkphfigqbmhgaxkbivip:9aPOcyUZZYpoObJM@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
`;

// Write to .env.local
const envLocalPath = path.join(__dirname, '../.env.local');
fs.writeFileSync(envLocalPath, adminAuthVars);
console.log('✅ Created .env.local with admin authentication variables');

console.log('\n📝 Next steps:');
console.log('1. Restart your development server');
console.log('2. Try creating an invoice again');
console.log('3. Make sure to set ADMIN_USERNAME and ADMIN_PASSWORD in your Vercel environment variables');
