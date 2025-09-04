# MPDEE Accounts

A professional accounting and invoice management system for MPDEE Creative. Built with modern web technologies for secure, efficient financial management.

## Features

- **Secure Authentication**: Password-protected admin access with session management
- **Client Management**: Complete client database with contact information and billing details
- **Invoice System**: Professional invoice creation, editing, and PDF generation
- **Expense Tracking**: Import and manage business expenses with CSV support
- **Email Integration**: Send invoices directly to clients via email
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Technology**: Built with Next.js 15, React, TypeScript, and Prisma
- **Cloud Database**: PostgreSQL database hosted on Supabase for production reliability

## Core Functionality

### Authentication & Security
- Secure login system with environment variable configuration
- Session management with secure cookies
- Protected routes for all sensitive operations

### Client Management
- Add, edit, and view client information
- Store billing addresses and contact details
- Prevent deletion of clients with existing invoices

### Invoice System
- Create professional invoices with multiple line items
- Generate PDF invoices with company branding
- Track invoice status (draft, sent, paid, overdue)
- Send invoices via email with PDF attachments
- Edit draft invoices (locked once sent)

### Expense Management
- Manual expense entry with categorization
- CSV import functionality for bank statements
- Review and approve imported transactions
- Track expense categories and amounts

## Getting Started

### Prerequisites
- Node.js 20 LTS or higher
- npm package manager
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/mattduff36/mpdee-accounts.git
cd mpdee-accounts

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Authentication
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# Database (Local Development)
DATABASE_URL="file:./dev.db"

# Production Database (Supabase)
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL="postgres://..."
POSTGRES_USER="postgres"
POSTGRES_HOST="db.xxx.supabase.co"
POSTGRES_PASSWORD="your_password"
POSTGRES_DATABASE="postgres"
POSTGRES_URL_NON_POOLING="postgres://..."

# Supabase Configuration
SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_JWT_SECRET="your_jwt_secret"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
COMPANY_EMAIL=admin@mpdee.co.uk
COMPANY_NAME=MPDEE

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

### Database Setup

#### Local Development (SQLite)
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) View database in Prisma Studio
npx prisma studio
```

#### Production (PostgreSQL/Supabase)
The production environment uses Supabase PostgreSQL. The database schema and data have been migrated from SQLite to PostgreSQL.

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Database**: 
  - Local Development: SQLite with Prisma ORM
  - Production: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: JWT with secure cookies
- **Email**: Nodemailer with Google SMTP
- **PDF Generation**: React-PDF
- **Testing**: Jest with React Testing Library

## Project Structure

```
mpdee-accounts/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout with authentication
│   │   ├── page.tsx           # Dashboard page
│   │   ├── login/             # Authentication pages
│   │   ├── clients/           # Client management pages
│   │   ├── invoices/          # Invoice management pages
│   │   ├── expenses/          # Expense management pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── Navigation.tsx     # Main navigation
│   │   ├── LoginForm.tsx      # Authentication form
│   │   ├── ClientForm.tsx     # Client management forms
│   │   └── InvoiceForm.tsx    # Invoice creation/editing
│   └── test/                  # Test files and mocks
├── lib/                       # Utility libraries
│   ├── auth.ts               # Authentication utilities
│   ├── db.ts                 # Database connection
│   ├── email.ts              # Email service
│   ├── pdf.tsx               # PDF generation
│   └── types.ts              # TypeScript definitions
├── prisma/                   # Database schema and migrations
├── scripts/                  # Database migration and utility scripts
├── database-backup/          # Local database backups
├── public/                   # Static assets
└── tasks/                    # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check authentication status

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `GET /api/invoices/[id]/pdf` - Generate PDF invoice
- `POST /api/invoices/[id]/send` - Send invoice via email
- `PUT /api/invoices/[id]/status` - Update invoice status

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get expense details
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense
- `POST /api/expenses/import` - Import expenses from CSV
- `GET /api/expenses/import/[id]/transactions` - Get imported transactions
- `POST /api/expenses/import/[id]/commit` - Commit selected transactions
- `POST /api/expenses/import/[id]/ignore` - Ignore import

## Security Features

- Environment variable configuration for sensitive data
- JWT-based authentication with secure cookies
- Protected API routes with middleware
- Input validation and sanitization
- SQL injection prevention with Prisma ORM
- XSS protection with React's built-in escaping

## Database Migration

The application has been successfully migrated from SQLite to PostgreSQL (Supabase) for production use. The migration included:

- **2 Clients** - All client data preserved
- **2 Invoices** - Complete invoice records with line items
- **5 Invoice Items** - Detailed line items for all invoices
- **70 Expenses** - All business expenses with categories

### Migration Scripts

The `scripts/` directory contains migration utilities:
- Database backup and restore scripts
- SQLite to PostgreSQL migration tools
- Data verification and validation scripts

## Deployment

This project is configured for deployment on Vercel with the domain `https://accounts.mpdee.info/`.

### Production Deployment

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod
```

### Production Status

✅ **Live Site**: https://accounts.mpdee.info/  
✅ **Database**: PostgreSQL (Supabase)  
✅ **Data Migration**: Complete  
✅ **All Features**: Operational  

## License

© 2025 MPDEE Creative. All rights reserved.

## Last Updated
August 2025 - Database migration to PostgreSQL completed successfully 