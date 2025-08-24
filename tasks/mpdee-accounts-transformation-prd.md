# Product Requirements Document (PRD)
## MPDEE Accounts Project Transformation

### 1. Executive Summary

**Project Name**: MPDEE Accounts Project Transformation  
**Project Type**: Codebase Restructuring and Domain Migration  
**Target Domain**: https://accounts.mpdee.info/  
**Current State**: Split-off accounts section from mpdee-creative project  
**Target State**: Dedicated accounts application at root level  

### 2. Project Overview

#### 2.1 Background
The MPDEE accounts functionality was previously part of the larger mpdee-creative project, accessible via the `/accounts` route. This project aims to transform it into a standalone accounts application that will be deployed to its own domain.

#### 2.2 Objectives
- Transform the accounts section into a dedicated application
- Remove all mpdee-creative related content
- Move accounts functionality to root level routing
- Prepare for deployment to https://accounts.mpdee.info/
- Ensure seamless functionality after transformation

#### 2.3 Success Criteria
- All accounts functionality works at root level
- No mpdee-creative content remains
- Application builds and runs successfully
- All routing and navigation works correctly
- Ready for deployment to new domain

### 3. Technical Requirements

#### 3.1 Current Architecture
```
src/app/
├── page.tsx (mpdee-creative homepage)
├── layout.tsx (mpdee-creative layout)
├── accounts/
│   ├── page.tsx (dashboard)
│   ├── layout.tsx (accounts layout)
│   ├── login/
│   ├── clients/
│   ├── invoices/
│   └── expenses/
└── api/ (accounts APIs)
```

#### 3.2 Target Architecture
```
src/app/
├── page.tsx (accounts dashboard)
├── layout.tsx (accounts-focused layout)
├── login/
├── clients/
├── invoices/
├── expenses/
└── api/ (accounts APIs)
```

#### 3.3 Routing Changes
| Current Route | Target Route | Description |
|---------------|--------------|-------------|
| `/` | `/` | Dashboard (was mpdee-creative homepage) |
| `/accounts` | `/` | Dashboard |
| `/accounts/login` | `/login` | Login page |
| `/accounts/clients` | `/clients` | Clients management |
| `/accounts/invoices` | `/invoices` | Invoice management |
| `/accounts/expenses` | `/expenses` | Expense management |

### 4. Functional Requirements

#### 4.1 Authentication System
- **Requirement**: Maintain existing JWT-based authentication
- **Scope**: Login, logout, session management
- **Routes**: `/login` (redirect from `/` if not authenticated)
- **Security**: All protected routes require authentication

#### 4.2 Dashboard
- **Requirement**: Move accounts dashboard to root level
- **Features**: 
  - Stats overview (clients, invoices, expenses, outstanding amounts)
  - Quick action buttons
  - Navigation to all sections
- **Authentication**: Redirect to login if not authenticated

#### 4.3 Client Management
- **Requirement**: Full CRUD operations for clients
- **Routes**: `/clients`, `/clients/new`, `/clients/[id]`
- **Features**: List, create, edit, delete clients

#### 4.4 Invoice Management
- **Requirement**: Complete invoice system
- **Routes**: `/invoices`, `/invoices/new`, `/invoices/[id]`
- **Features**: Create, edit, send, generate PDF, status tracking

#### 4.5 Expense Management
- **Requirement**: Expense tracking and import functionality
- **Routes**: `/expenses`, `/expenses/new`, `/expenses/import`
- **Features**: Manual entry, CSV import, categorization

### 5. Non-Functional Requirements

#### 5.1 Performance
- **Build Time**: < 15 seconds
- **Page Load**: < 3 seconds for authenticated pages
- **API Response**: < 1 second for all endpoints

#### 5.2 Security
- **Authentication**: JWT tokens with proper expiration
- **Authorization**: Role-based access control
- **Data Protection**: Secure API endpoints
- **SEO**: No indexing (robots: noindex, nofollow)

#### 5.3 Compatibility
- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Devices**: Desktop, tablet, mobile responsive
- **Framework**: Next.js 15.4.2 compatibility

### 6. Content Removal Requirements

#### 6.1 Components to Remove
- `src/components/Hero.tsx`
- `src/components/Services.tsx`
- `src/components/Contact.tsx`
- `src/components/Footer.tsx`
- `src/components/ClientLogin.tsx`
- `src/components/ConstructionBanner.tsx`
- `src/components/StructuredData.tsx`
- `src/components/Layout.tsx` (mpdee-creative version)

#### 6.2 Files to Remove
- `src/app/accounts/` directory (after moving content)
- `src/components/accounts/` directory (after moving components)
- Any mpdee-creative specific assets

#### 6.3 Configuration Updates
- Update `package.json` name and description
- Update metadata in layout.tsx
- Update navigation branding
- Update Google Analytics configuration

### 7. Implementation Plan

#### 7.1 Phase 1: Structure Setup
1. Update root layout.tsx for accounts focus
2. Move accounts page to root level
3. Create new directory structure
4. Update package.json

#### 7.2 Phase 2: Component Migration
1. Move accounts components to main components directory
2. Update Navigation component for root routing
3. Remove mpdee-creative components
4. Update all import statements

#### 7.3 Phase 3: Routing Updates
1. Move all accounts pages to root level
2. Update all internal routing references
3. Update navigation links
4. Test all routes and redirects

#### 7.4 Phase 4: Content Cleanup
1. Remove unused components
2. Clean up unused assets
3. Update metadata and SEO
4. Remove mpdee-creative references

#### 7.5 Phase 5: Testing & Validation
1. Build testing
2. Functionality testing
3. Authentication testing
4. Navigation testing
5. API endpoint testing

### 8. Risk Assessment

#### 8.1 Technical Risks
- **Risk**: Breaking existing functionality during migration
- **Mitigation**: Incremental changes with testing at each step
- **Risk**: Import path issues
- **Mitigation**: Systematic update of all import statements

#### 8.2 Business Risks
- **Risk**: Downtime during deployment
- **Mitigation**: Thorough testing before deployment
- **Risk**: User confusion with new routing
- **Mitigation**: Clear documentation and redirects

### 9. Testing Strategy

#### 9.1 Unit Testing
- Component functionality
- API endpoint responses
- Authentication flows

#### 9.2 Integration Testing
- Navigation flows
- Data persistence
- Cross-page functionality

#### 9.3 User Acceptance Testing
- Login/logout flows
- CRUD operations
- Dashboard functionality
- Mobile responsiveness

### 10. Deployment Requirements

#### 10.1 Pre-deployment Checklist
- [ ] All routes working correctly
- [ ] Authentication system functional
- [ ] Database connections working
- [ ] API endpoints responding
- [ ] Build process successful
- [ ] No console errors
- [ ] Mobile responsive design

#### 10.2 Post-deployment Validation
- [ ] Domain accessible
- [ ] Login functionality working
- [ ] All features operational
- [ ] Performance acceptable
- [ ] Security measures active

### 11. Success Metrics

#### 11.1 Technical Metrics
- Build success rate: 100%
- Page load times: < 3 seconds
- API response times: < 1 second
- Error rate: < 1%

#### 11.2 User Experience Metrics
- Login success rate: > 95%
- Navigation completion rate: > 90%
- Feature usage: All core features accessible

### 12. Timeline

#### 12.1 Estimated Duration
- **Total Time**: 4-6 hours
- **Phase 1**: 1 hour
- **Phase 2**: 1 hour
- **Phase 3**: 1 hour
- **Phase 4**: 1 hour
- **Phase 5**: 2 hours

#### 12.2 Milestones
- **Milestone 1**: Basic structure complete
- **Milestone 2**: Components migrated
- **Milestone 3**: Routing functional
- **Milestone 4**: Cleanup complete
- **Milestone 5**: Ready for deployment

### 13. Dependencies

#### 13.1 Technical Dependencies
- Next.js 15.4.2
- Prisma database
- JWT authentication
- Existing API endpoints

#### 13.2 External Dependencies
- Vercel deployment platform
- Domain configuration (accounts.mpdee.info)
- Database access

### 14. Approval

**Prepared By**: AI Assistant  
**Date**: August 24, 2025  
**Status**: Ready for Implementation  

---

**Next Steps**:
1. Review and approve PRD
2. Begin Phase 1 implementation
3. Regular progress updates
4. Final testing and deployment
