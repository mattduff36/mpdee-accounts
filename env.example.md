# MPDEE Accounts Environment Variables
# Copy this file to .env.local and customize as needed

# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
NEXTAUTH_SECRET=your_jwt_secret_key_min_32_characters
NEXTAUTH_URL=http://localhost:3000

# Database (PostgreSQL for production, SQLite for local dev)
# PostgreSQL (Neon)
POSTGRES_PRISMA_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Company Information
COMPANY_NAME=MPDEE
COMPANY_EMAIL=admin@mpdee.co.uk
COMPANY_PHONE=
COMPANY_ADDRESS=

# Invoice Configuration
INVOICE_PREFIX=MPD
DEFAULT_PAYMENT_TERMS=30

# Node Environment
NODE_ENV=development
