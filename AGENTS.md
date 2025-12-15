# Repository Guidelines

## Project Structure & Module Organization

**Frontend (Next.js App):**
- `app/` - Next.js App Router pages (sales, products, attendants, expenses, etc.)
- `components/` - Reusable React components organized by feature
- `store/atoms/` - Zustand state management stores
- `utils/` - Custom hooks and utility functions
- `public/` - Static assets, PWA files, and icons

**Backend (Node.js API):**
- `mauzo_back/` - Express.js API server with Sequelize ORM
- `mauzo_back/routes/` - API route handlers
- `mauzo_back/models/` - Database models
- `mauzo_back/migrations/` - Database migration files

## Build, Test, and Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Coding Style & Naming Conventions

- **Indentation**: 2 spaces (configured in TypeScript/Next.js)
- **File naming**: kebab-case for directories, camelCase for components
- **Component naming**: PascalCase for React components
- **Variable naming**: camelCase for variables and functions
- **Linting**: ESLint with Next.js configuration (`eslint.config.mjs`)

## Testing Guidelines

- **Framework**: No specific testing framework configured yet
- **Test files**: Follow Next.js conventions when implemented
- **Running tests**: Use `npm test` when test suite is added

## Commit & Pull Request Guidelines

- **Commit format**: Descriptive messages (examples from repo: "first commit", "yt6yt7765trt456trtrttr")
- **PR process**: Standard GitHub workflow
- **Branch naming**: Use descriptive branch names for features

---

# Repository Tour

## 🎯 What This Repository Does

Mauzo is a comprehensive Point of Sale (POS) and business management system designed for multi-business operations, featuring sales analytics, inventory management, and multi-language support (English/Swahili).

**Key responsibilities:**
- Multi-business sales and inventory management
- Real-time sales analytics with hourly breakdowns
- Employee (attendant) and client management
- Expense tracking and damage reporting
- Progressive Web App with offline capabilities

---

## 🏗️ Architecture Overview

### System Context
```
[Mobile/Web Client] → [Next.js Frontend] → [Node.js API] → [Database]
                            ↓
                    [PWA Service Worker]
```

### Key Components
- **Frontend App Router** - Next.js 15 with App Router for page routing and layouts
- **State Management** - Zustand stores for global state (business selection, language, errors)
- **API Integration** - Custom fetch hooks with JWT authentication for backend communication
- **PWA Layer** - Service worker for offline functionality and app-like experience
- **Multi-language System** - Dynamic language switching between English and Swahili

### Data Flow
1. User authenticates via JWT tokens stored in localStorage
2. Business selection determines data context for all operations
3. API requests include business_id and authorization headers
4. Real-time data updates through custom fetch hooks
5. State management ensures consistent UI updates across components

---

## 📁 Project Structure [Partial Directory Tree]

```
mauzo/
├── app/                           # Next.js App Router pages
│   ├── attendants/               # Employee management
│   ├── business/                 # Business settings
│   ├── clients/                  # Customer management
│   ├── damages/                  # Damage tracking
│   ├── deleted/                  # Soft-deleted items management
│   ├── expenses/                 # Expense tracking
│   ├── login/                    # Authentication pages
│   ├── products/                 # Product management
│   ├── sales/                    # Sales management
│   ├── layout.tsx                # Root layout with PWA setup
│   └── page.tsx                  # Dashboard with sales analytics
├── components/                    # Reusable React components
│   ├── business/                 # Business-related components
│   ├── deleted/                  # Deleted items management
│   ├── layout/                   # Layout components
│   ├── reusables/                # Generic reusable components
│   └── sales/                    # Sales-specific components
├── store/atoms/                   # Zustand state stores
│   ├── error.tsx                 # Error state management
│   ├── language.tsx              # Language preference
│   └── selected_business.tsx     # Current business context
├── utils/                         # Utility functions
│   ├── fetch.tsx                 # Custom fetch hook with auth
│   ├── useSendRequest.tsx        # POST request utility
│   └── useSendMultipartRequest.tsx # File upload utility
├── public/                        # Static assets
│   ├── icons/                    # PWA icons
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
└── mauzo_back/                   # Backend API (Node.js)
    ├── routes/                   # API endpoints
    ├── models/                   # Database models
    └── migrations/               # Database migrations
```

### Key Files to Know

| File | Purpose | When You'd Touch It |
|------|---------|---------------------|
| `app/layout.tsx` | Root layout with PWA setup | Adding global providers or PWA config |
| `app/page.tsx` | Main dashboard with analytics | Modifying dashboard metrics |
| `components/layout/layout.tsx` | Main app layout with navigation | Changing navigation or layout structure |
| `store/atoms/selected_business.tsx` | Business context state | Adding business-related state |
| `utils/fetch.tsx` | Custom fetch hook with auth | Modifying API request patterns |
| `package.json` | Dependencies and scripts | Adding new packages or scripts |
| `next.config.ts` | Next.js configuration | Changing build or runtime config |
| `public/manifest.json` | PWA configuration | Updating PWA settings |

---

## 🔧 Technology Stack

### Core Technologies
- **Language:** TypeScript 5 - Type safety and better developer experience
- **Framework:** Next.js 15.3.2 - React framework with App Router
- **Frontend Library:** React 19 - Latest React with concurrent features
- **Database ORM:** Sequelize - Based on migration files in backend

### Key Libraries
- **Zustand** - Lightweight state management for global app state
- **Axios** - HTTP client for API requests with interceptors
- **Framer Motion** - Animation library for smooth UI transitions
- **JWT Decode** - JWT token parsing for authentication
- **Lucide React** - Modern icon library
- **Date-fns** - Date manipulation and formatting
- **Classnames** - Conditional CSS class management

### Development Tools
- **ESLint** - Code linting with Next.js configuration
- **TypeScript** - Static type checking
- **SCSS** - CSS preprocessing with module support
- **PWA** - Progressive Web App capabilities

---

## 🌐 External Dependencies

### Required Services
- **Backend API** - Node.js API server running on localhost:5000 (development)
- **Database** - SQL database managed through Sequelize ORM
- **Authentication** - JWT-based authentication system

### Optional Integrations
- **PWA Features** - Service worker for offline functionality
- **Multi-language** - Dynamic language switching (English/Swahili)

### Environment Variables

```bash
# API Configuration (inferred from code)
API_BASE_URL=http://62.169.30.105:5000    # Backend API endpoint
JWT_SECRET=                           # JWT signing secret (backend)
DATABASE_URL=                         # Database connection string (backend)

# PWA Configuration
NEXT_PUBLIC_APP_NAME=E-Mauzo         # App name for PWA
```

---

## 🔄 Common Workflows

### User Authentication Flow
1. User accesses sign_log page for login/registration
2. JWT token stored in localStorage upon successful authentication
3. Token included in Authorization header for all API requests
4. Token expiration checked on each request with automatic logout

**Code path:** `app/sign_log/page.tsx` → `utils/useSendRequest.tsx` → `components/layout/layout.tsx`

### Business Selection Workflow
1. User selects business from dropdown in header
2. Business ID stored in localStorage and Zustand store
3. All subsequent API requests include business_id parameter
4. Page reload ensures consistent business context

**Code path:** `components/layout/layout.tsx` → `store/atoms/selected_business.tsx` → API requests

### Sales Analytics Dashboard
1. Dashboard loads with current business context
2. Fetch sales analytics data with date range filters
3. Display metrics cards, hourly sales, and top products
4. Interactive hourly breakdown with detailed product views

**Code path:** `app/page.tsx` → `utils/fetch.tsx` → `components/sales/hourlySales`

---

## 📈 Performance & Scale

### Performance Considerations
- **PWA Caching** - Service worker implements network-first strategy with cache fallback
- **Package Optimization** - Next.js config optimizes lucide-react and react-icons imports
- **State Management** - Zustand provides minimal re-renders with selective subscriptions

### Monitoring
- **Error Handling** - Global error state management through Zustand
- **Loading States** - Custom fetch hooks provide loading indicators
- **Authentication** - JWT token expiration monitoring with automatic logout

---

## 🚨 Things to Be Careful About

### 🔒 Security Considerations
- **JWT Storage** - Tokens stored in localStorage (consider httpOnly cookies for production)
- **API Authentication** - All API requests require valid JWT tokens
- **Business Context** - Ensure business_id validation to prevent cross-business data access

### 🔧 Development Notes
- **API Endpoints** - Currently hardcoded to localhost:5000 (needs environment configuration)
- **State Persistence** - Business selection and language preferences stored in localStorage
- **PWA Setup** - Service worker registered in layout.tsx for offline functionality

*Updated at: 2025-01-27 UTC*