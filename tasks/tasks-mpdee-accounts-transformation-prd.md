# Task List: MPDEE Accounts Project Transformation

Based on: `mpdee-accounts-transformation-prd.md`

## Relevant Files

- `src/app/layout.tsx` - Main layout file to be updated for accounts focus
- `src/app/page.tsx` - Root page to be replaced with accounts dashboard
- `src/app/login/page.tsx` - Login page to be moved from accounts subdirectory
- `src/app/clients/page.tsx` - Clients listing page to be moved from accounts subdirectory
- `src/app/clients/[id]/page.tsx` - Client detail page to be moved from accounts subdirectory
- `src/app/clients/new/page.tsx` - New client page to be moved from accounts subdirectory
- `src/app/invoices/page.tsx` - Invoices listing page to be moved from accounts subdirectory
- `src/app/invoices/[id]/page.tsx` - Invoice detail page to be moved from accounts subdirectory
- `src/app/invoices/new/page.tsx` - New invoice page to be moved from accounts subdirectory
- `src/app/expenses/page.tsx` - Expenses listing page to be moved from accounts subdirectory
- `src/app/expenses/[id]/page.tsx` - Expense detail page to be moved from accounts subdirectory
- `src/app/expenses/new/page.tsx` - New expense page to be moved from accounts subdirectory
- `src/app/expenses/import/page.tsx` - Expense import page to be moved from accounts subdirectory
- `src/components/Navigation.tsx` - Main navigation component to be updated for root routing
- `src/components/LoginForm.tsx` - Login form component to be moved from accounts subdirectory
- `src/components/ClientForm.tsx` - Client form component to be moved from accounts subdirectory
- `src/components/InvoiceForm.tsx` - Invoice form component to be moved from accounts subdirectory
- `package.json` - Package configuration to be updated for accounts project
- `src/app/globals.css` - Global styles that may need updates
- `src/app/not-found.tsx` - 404 page that may need updates

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- All existing API routes in `src/app/api/` should remain unchanged as they are already at root level.
- The existing `src/app/accounts/` directory should be removed after all content is moved to root level.
- The existing `src/components/accounts/` directory should be removed after all components are moved to main components directory.

## Tasks

- [x] 1.0 Update Project Structure and Configuration
  - [x] 1.1 Update package.json name and description to "mpdee-accounts"
  - [x] 1.2 Update src/app/layout.tsx metadata for accounts domain (accounts.mpdee.info)
  - [x] 1.3 Remove mpdee-creative references from layout.tsx
  - [x] 1.4 Update Google Analytics configuration for accounts tracking
  - [x] 1.5 Replace src/app/page.tsx with accounts dashboard content
  - [x] 1.6 Create directory structure for root-level routes (/login, /clients, /invoices, /expenses)

- [x] 2.0 Migrate Components to Root Level
  - [x] 2.1 Move src/components/accounts/Navigation.tsx to src/components/Navigation.tsx
  - [x] 2.2 Move src/components/accounts/LoginForm.tsx to src/components/LoginForm.tsx
  - [x] 2.3 Move src/components/accounts/ClientForm.tsx to src/components/ClientForm.tsx
  - [x] 2.4 Move src/components/accounts/InvoiceForm.tsx to src/components/InvoiceForm.tsx
  - [x] 2.5 Update Navigation component links from /accounts/* to root level routes
  - [x] 2.6 Update logout redirect from /accounts/login to /login
  - [x] 2.7 Update all import statements in moved components

- [x] 3.0 Move All Pages to Root Level Routing
  - [x] 3.1 Move src/app/accounts/login/page.tsx to src/app/login/page.tsx
  - [x] 3.2 Move src/app/accounts/clients/page.tsx to src/app/clients/page.tsx
  - [x] 3.3 Move src/app/accounts/clients/[id]/page.tsx to src/app/clients/[id]/page.tsx
  - [x] 3.4 Move src/app/accounts/clients/new/page.tsx to src/app/clients/new/page.tsx
  - [x] 3.5 Move src/app/accounts/invoices/page.tsx to src/app/invoices/page.tsx
  - [x] 3.6 Move src/app/accounts/invoices/[id]/page.tsx to src/app/invoices/[id]/page.tsx
  - [x] 3.7 Move src/app/accounts/invoices/new/page.tsx to src/app/invoices/new/page.tsx
  - [x] 3.8 Move src/app/accounts/expenses/page.tsx to src/app/expenses/page.tsx
  - [x] 3.9 Move src/app/accounts/expenses/[id]/page.tsx to src/app/expenses/[id]/page.tsx
  - [x] 3.10 Move src/app/accounts/expenses/new/page.tsx to src/app/expenses/new/page.tsx
  - [x] 3.11 Move src/app/accounts/expenses/import/page.tsx to src/app/expenses/import/page.tsx

- [x] 4.0 Update Navigation and Internal References
  - [x] 4.1 Update all router.push() calls from /accounts/* to root level routes
  - [x] 4.2 Update all Link href attributes from /accounts/* to root level routes
  - [x] 4.3 Update all redirect logic in authentication flows
  - [x] 4.4 Update breadcrumb navigation links
  - [x] 4.5 Update any hardcoded route references in components
  - [x] 4.6 Update import statements in all moved pages to reference new component locations

- [x] 5.0 Remove mpdee-creative Content and Cleanup
  - [x] 5.1 Remove src/components/Hero.tsx
  - [x] 5.2 Remove src/components/Services.tsx
  - [x] 5.3 Remove src/components/Contact.tsx
  - [x] 5.4 Remove src/components/Footer.tsx
  - [x] 5.5 Remove src/components/ClientLogin.tsx
  - [x] 5.6 Remove src/components/ConstructionBanner.tsx
  - [x] 5.7 Remove src/components/StructuredData.tsx
  - [x] 5.8 Remove src/components/Layout.tsx (mpdee-creative version)
  - [x] 5.9 Remove src/app/accounts/ directory after all content is moved
  - [x] 5.10 Remove src/components/accounts/ directory after all components are moved
  - [x] 5.11 Update src/app/not-found.tsx for accounts context
  - [x] 5.12 Clean up any unused imports and dependencies

- [ ] 6.0 Testing and Validation
  - [ ] 6.1 Test application build process (npm run build)
  - [ ] 6.2 Test authentication system (login/logout flows)
  - [ ] 6.3 Test all navigation routes and links
  - [ ] 6.4 Test API endpoints functionality
  - [ ] 6.5 Test client management CRUD operations
  - [ ] 6.6 Test invoice management functionality
  - [ ] 6.7 Test expense management and import functionality
  - [ ] 6.8 Test dashboard stats and quick actions
  - [ ] 6.9 Test mobile responsiveness
  - [ ] 6.10 Verify no mpdee-creative content remains
  - [ ] 6.11 Test performance (page load times, API response times)
