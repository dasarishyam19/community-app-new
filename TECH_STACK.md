# Tech Stack Documentation

## Frontend Framework
- **Next.js 16.1.6** (App Router with Turbopack)
  - React Server Components
  - File-based routing
  - API routes for serverless functions
  - Automatic code splitting

## UI & Styling
- **Tailwind CSS v4**
  - Utility-first CSS framework
  - Dark mode support
  - Responsive design utilities
  - Custom color schemes
- **Framer Motion**
  - Animation library
  - Page transitions
  - Gesture animations
- **Lucide React**
  - Icon library (replacing emoji icons)
  - Consistent icon set
  - Tree-shakeable

## State Management
- **React Context API**
  - AuthContext: Authentication state
  - ThemeContext: Theme management
- **React Hooks**
  - useState for local state
  - useEffect for side effects
  - Custom hooks for reusable logic

## Form Handling
- **React Hook Form**
  - Form state management
  - Validation integration
- **Zod**
  - Schema validation
  - TypeScript integration
  - Runtime type checking

## Backend / Database
- **Firebase**
  - **Firestore**: NoSQL document database
  - **Firebase Auth**: Authentication service
  - **Firebase Hosting**: Deployment platform
- **Data Collections**:
  - users
  - communities
  - posts
  - polls
  - alerts
  - bills
  - payments
  - notifications
  - transactions

## Authentication & Security
- **WhatsApp OTP** (Twilio)
  - Phone-based authentication
  - Redis for OTP storage
- **Firebase Phone Auth** (legacy, not actively used)
- **Role-Based Access Control**
  - Roles: user, admin, super_admin
  - Route protection based on roles

## External APIs
- **Twilio WhatsApp API**
  - Send OTP messages via WhatsApp
  - Sandbox mode for testing
- **OpenStreetMap Nominatim API**
  - Reverse geocoding
  - Location name lookup
- **Leaflet**
  - Interactive maps
  - Community location markers

## Cache & Session Storage
- **Redis**
  - OTP storage with TTL
  - Temporary data caching
- **LocalStorage**
  - Theme preference persistence
  - Client-side data caching

## Development Tools
- **TypeScript**
  - Static type checking
  - Enhanced developer experience
  - Interface definitions for all models
- **ESLint**
  - Code quality enforcement
  - Best practices validation
- **Prettier**
  - Code formatting
  - Consistent style

## Deployment
- **Vercel** (recommended for Next.js)
  - Automatic deployments from Git
  - Edge network caching
  - Serverless functions
- **Firebase Hosting** (alternative)
  - Static site hosting
  - CDN distribution

## Package Managers
- **npm** (Node Package Manager)
  - Dependency management
  - Script execution

## Browser APIs
- **Geolocation API**
  - User location detection
  - Community radius calculation
- **LocalStorage API**
  - Theme persistence
  - Client-side preferences

## Key Dependencies
```json
{
  "next": "^16.1.6",
  "react": "^19.x",
  "typescript": "^5.x",
  "tailwindcss": "^4.x",
  "firebase": "^11.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.x",
  "ioredis": "^5.x",
  "twilio": "^5.x"
}
```

## File Structure
```
community-app-new/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── otp/              # OTP endpoints
│   │   ├── auth/             # Auth endpoints
│   │   ├── posts/            # Post CRUD
│   │   ├── polls/            # Poll CRUD
│   │   ├── alerts/           # Alert CRUD
│   │   └── bills/            # Bill CRUD
│   ├── app/                 # Main app (feed)
│   ├── admin/               # Admin dashboard
│   ├── dashboard/           # User dashboard
│   ├── community/           # Community feed
│   ├── polls/               # Polls page
│   ├── bills/               # Bills page
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── CommunityFeed.tsx
│   ├── BillsPage.tsx
│   ├── AlertsPage.tsx
│   ├── ProfilePage.tsx
│   └── ...
├── contexts/                # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/                     # Utility libraries
│   ├── firebase/            # Firebase setup
│   ├── firestore.ts        # Firestore utilities
│   ├── whatsapp.ts         # WhatsApp integration
│   └── redis.ts            # Redis client
├── types/                   # TypeScript types
│   └── database.ts         # Data models
└── public/                  # Static assets
```

## Environment Variables
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
WHATSAPP_FROM_NUMBER=

# Redis
REDIS_URL=

# App
NEXT_PUBLIC_APP_URL=
```

## Coding Standards
- **Functional Components**: All components use functional syntax with hooks
- **TypeScript**: Strict mode enabled, all files typed
- **Naming Conventions**:
  - Components: PascalCase (e.g., `UserProfile.tsx`)
  - Functions: camelCase (e.g., `getUserData`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
  - Interfaces/Types: PascalCase (e.g., `UserData`)
- **File Organization**:
  - One component per file
  - Co-locate related files
  - Use barrel exports (index.ts) for clean imports

## Performance Optimizations
- **Dynamic Imports**: Heavy components loaded on demand
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components loaded when needed
- **Memoization**: React.memo, useMemo, useCallback where appropriate

## Testing Strategy
- **Unit Tests**: Critical business logic
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows
- **Type Checking**: TypeScript compiler
