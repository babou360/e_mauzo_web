# Repository Tour

## 🎯 What This Repository Does

Mauzo is a comprehensive Point of Sale (POS) and business management system designed for multi-business operations, featuring sales analytics, inventory management, and multi-language support (English/Swahili).

**Key responsibilities:**
- Multi-business sales and inventory management with real-time analytics
- Employee (attendant) and client management with role-based access
- Expense tracking, damage reporting, and comprehensive business analytics
- Progressive Web App with offline capabilities and mobile-first design

---

## 🏗️ Architecture Overview

### System Context
```
[Mobile/Web Client] → [Next.js Frontend] → [Node.js API] → [SQL Database]
                            ↓
                    [PWA Service Worker]
                            ↓
                    [Local Storage Cache]
```

### Key Components
- **Frontend App Router** - Next.js 15 with App Router for page routing and layouts
- **State Management** - Zustand stores for global state (business selection, language, errors)
- **API Integration** - Custom fetch hooks with JWT authentication for backend communication
- **PWA Layer** - Service worker for offline functionality and app-like experience
- **Multi-language System** - Dynamic language switching between English and Swahili
- **Authentication System** - JWT-based authentication with automatic token management

### Data Flow
1. User authenticates via JWT tokens stored in localStorage
2. Business selection determines data context for all operations
3. API requests include business_id and authorization headers
4. Real-time data updates through custom fetch hooks with automatic error handling
5. State management ensures consistent UI updates across components

---

## 📁 Project Structure [Partial Directory Tree]

```
mauzo/
├── app/                           # Next.js App Router pages
│   ├── attendants/               # Employee management
│   ├── business/                 # Business settings and configuration
│   ├── clients/                  # Customer management
│   ├── damages/                  # Damage tracking and reporting
│   ├── deleted/                  # Soft-deleted items management
│   ├── expenses/                 # Expense tracking and categorization
│   ├── login/                    # Authentication pages
│   ├── products/                 # Product inventory management
│   ├── sales/                    # Sales management and POS
│   ├── sign_log/                 # Login/registration flow
│   ├── user/verify/              # User verification
│   ├── layout.tsx                # Root layout with PWA setup
│   └── page.tsx                  # Dashboard with sales analytics
├── components/                    # Reusable React components
│   ├── business/                 # Business-related components
│   ├── deleted/                  # Deleted items management
│   ├── layout/                   # Layout components with navigation
│   ├── reusables/                # Generic reusable components
│   └── sales/                    # Sales-specific components
├── store/atoms/                   # Zustand state stores
│   ├── error.tsx                 # Global error state management
│   ├── language.tsx              # Language preference (EN/SW)
│   ├── selected_business.tsx     # Current business context
│   └── isAddBusiness.tsx         # Business creation modal state
├── utils/                         # Utility functions and hooks
│   ├── fetch.tsx                 # Custom fetch hook with auth
│   ├── useSendRequest.tsx        # POST request utility
│   └── useSendMultipartRequest.tsx # File upload utility
├── public/                        # Static assets and PWA files
│   ├── icons/                    # PWA icons (192x192, 512x512)
│   ├── manifest.json             # PWA manifest configuration
│   ├── sw.js                     # Service worker for offline support
│   ├── tanzania.png              # Swahili language flag
│   └── usa.svg                   # English language flag
└── Configuration Files
    ├── next.config.ts            # Next.js configuration
    ├── package.json              # Dependencies and scripts
    ├── tsconfig.json             # TypeScript configuration
    └── eslint.config.mjs         # ESLint configuration
```

### Key Files to Know

| File | Purpose | When You'd Touch It |
|------|---------|---------------------|
| `app/layout.tsx` | Root layout with PWA setup and providers | Adding global providers or PWA config |
| `app/page.tsx` | Main dashboard with sales analytics | Modifying dashboard metrics or layout |
| `components/layout/layout.tsx` | Main app layout with navigation | Changing navigation structure or sidebar |
| `store/atoms/selected_business.tsx` | Business context state | Adding business-related state management |
| `utils/fetch.tsx` | Custom fetch hook with JWT auth | Modifying API request patterns or auth |
| `app/sales/page.tsx` | Complete POS system | Adding sales features or payment methods |
| `package.json` | Dependencies and build scripts | Adding new packages or build commands |
| `next.config.ts` | Next.js build configuration | Changing optimization or build settings |
| `public/manifest.json` | PWA configuration | Updating PWA settings or app metadata |

---

## 🔧 Technology Stack

### Core Technologies
- **Language:** TypeScript 5 - Type safety and enhanced developer experience
- **Framework:** Next.js 15.3.2 - React framework with App Router and SSR
- **Frontend Library:** React 19 - Latest React with concurrent features
- **Styling:** SCSS with CSS Modules - Component-scoped styling

### Key Libraries
- **Zustand 5.0.5** - Lightweight state management for global app state
- **Axios 1.9.0** - HTTP client for API requests with interceptors
- **Framer Motion 12.19.1** - Animation library for smooth UI transitions
- **JWT Decode 4.0.0** - JWT token parsing for authentication
- **Lucide React 0.552.0** - Modern icon library with tree-shaking
- **Date-fns 4.1.0** - Date manipulation and formatting utilities
- **Classnames 2.5.1** - Conditional CSS class management

### Development Tools
- **ESLint 9** - Code linting with Next.js configuration
- **TypeScript 5** - Static type checking and IntelliSense
- **SCSS/Sass 1.88.0** - CSS preprocessing with module support
- **React Icons 5.5.0** - Additional icon library for UI elements

---

## 🌐 External Dependencies

### Required Services
- **Backend API** - Node.js Express server with Sequelize ORM (localhost:5000 in development)
- **SQL Database** - Relational database managed through Sequelize migrations
- **Authentication Service** - JWT-based authentication with token refresh

### Optional Integrations
- **PWA Features** - Service worker for offline functionality and app installation
- **Multi-language Support** - Dynamic language switching with localStorage persistence
- **Print Service** - Browser-based receipt printing for sales transactions

### Environment Variables

```bash
# API Configuration (inferred from codebase)
NEXT_PUBLIC_HOST=http://62.169.30.105:5000  # Backend API endpoint
JWT_SECRET=                                # JWT signing secret (backend)
DATABASE_URL=                              # Database connection string (backend)

# PWA Configuration
NEXT_PUBLIC_APP_NAME=E-Mauzo              # App name for PWA manifest
NEXT_PUBLIC_THEME_COLOR=#4f46e5           # PWA theme color
```

---

## 🔄 Common Workflows

### User Authentication & Business Selection
1. User accesses `/sign_log` for login/registration with form validation
2. JWT token stored in localStorage upon successful authentication
3. User selects business from dropdown, stored in localStorage and Zustand
4. All API requests include business_id and Authorization headers
5. Token expiration monitored with automatic logout on expiry

**Code path:** `app/sign_log/page.tsx` → `utils/useSendRequest.tsx` → `components/layout/layout.tsx` → `store/atoms/selected_business.tsx`

### Point of Sale Transaction
1. Navigate to `/sales` and click "Add Sale" to open POS modal
2. Search and select products with quantity adjustment controls
3. Configure customer details, discounts, and payment method
4. Submit transaction with real-time inventory updates
5. Generate printable receipt with business and transaction details

**Code path:** `app/sales/page.tsx` → `utils/useSendRequest.tsx` → Receipt generation → Inventory update

### Sales Analytics Dashboard
1. Dashboard loads with current business context and date filters
2. Fetch comprehensive analytics including hourly breakdowns
3. Display metric cards (total sales, revenue, profit, damages)
4. Interactive hourly sales table with detailed product views
5. Real-time updates when new sales are processed

**Code path:** `app/page.tsx` → `utils/fetch.tsx` → `components/sales/hourlySales` → Analytics API

---

## 📈 Performance & Scale

### Performance Considerations
- **PWA Caching** - Service worker implements cache-first strategy for static assets
- **Package Optimization** - Next.js config optimizes lucide-react and react-icons imports
- **State Management** - Zustand provides minimal re-renders with selective subscriptions
- **Code Splitting** - Next.js App Router enables automatic code splitting per route

### Monitoring
- **Error Handling** - Global error state management through Zustand with user notifications
- **Loading States** - Custom fetch hooks provide consistent loading indicators
- **Authentication Monitoring** - JWT token expiration tracking with automatic logout
- **Business Context Validation** - Ensures data isolation between different businesses

---

## 🚨 Things to Be Careful About

### 🔒 Security Considerations
- **JWT Storage** - Tokens stored in localStorage (consider httpOnly cookies for production)
- **API Authentication** - All protected routes require valid JWT tokens with business context
- **Business Data Isolation** - Strict business_id validation prevents cross-business data access
- **Input Validation** - Client-side validation complemented by server-side validation

### 🔧 Development Notes
- **API Endpoints** - Currently hardcoded to localhost:5000 (needs environment configuration for production)
- **State Persistence** - Business selection and language preferences persist in localStorage
- **PWA Registration** - Service worker registered in root layout for offline functionality
- **Multi-language** - Language switching requires page reload for complete UI updates
- **Print Functionality** - Uses browser print API, may need adjustment for different browsers

### 🌍 Internationalization
- **Language Support** - English and Swahili with dynamic switching
- **Currency Display** - Tanzanian Shilling (TZS) formatting throughout the application
- **Date Formatting** - Localized date/time display with timezone adjustments

*Updated at: 2025-01-27 UTC*