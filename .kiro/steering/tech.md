# Technology Stack

## Architecture Overview

**Meiso** is built as a modern single-page application (SPA) using React with Next.js App Router architecture. The application follows a client-server model with Supabase providing backend-as-a-service functionality for authentication, database, and real-time features.

## Frontend Stack

### Core Framework
- **Next.js 15.4.6**: React meta-framework with App Router for file-based routing
- **React 19.1.0**: Latest React with concurrent features and improved performance
- **TypeScript 5.x**: Full type safety across the application with strict configuration

### UI & Styling
- **Tailwind CSS 4.x**: Utility-first CSS framework for rapid UI development
- **Framer Motion 12.x**: Animation library for smooth, performant motion design
- **CSS-in-JS**: Component-scoped styling with Tailwind's component layer approach

### State Management & Data Fetching
- **React Hooks**: Built-in state management with useState, useEffect, useContext
- **Custom Hooks**: Specialized hooks for meditation logic, auth, and data management
- **Context API**: Global state for authentication and theme management
- **Supabase Client**: Real-time data synchronization and optimistic updates

## Backend & Infrastructure

### Backend-as-a-Service
- **Supabase**: PostgreSQL database with real-time subscriptions, authentication, and API generation
- **Row Level Security (RLS)**: Database-level security for user data isolation
- **PostgreSQL**: Relational database with JSON support for flexible schema design

### Authentication
- **Supabase Auth**: Email/password authentication with anonymous user support
- **JWT Tokens**: Secure token-based authentication with automatic refresh
- **User Profiles**: Extended user data with preferences and statistics tracking

## Development Environment

### Package Management & Build Tools
- **npm**: Package manager with lock file for reproducible builds
- **Next.js Build System**: Automatic code splitting, optimization, and bundling
- **Turbopack**: Development mode bundler for faster hot reloading

### Code Quality & Testing
- **ESLint 9.x**: JavaScript/TypeScript linting with Next.js recommended rules
- **Prettier 3.x**: Code formatting with automatic formatting on save
- **Jest 30.x**: Testing framework with jsdom environment for React components
- **React Testing Library 16.x**: Component testing with user-centric approach
- **@testing-library/jest-dom**: Extended Jest matchers for DOM testing

### Development Workflow
- **Husky 9.x**: Git hooks for pre-commit validation
- **lint-staged**: Run linting and formatting only on staged files
- **TypeScript Strict Mode**: Maximum type safety with strict compiler options

## Audio & Media

### Web Audio API
- **Native Web Audio**: Browser-native audio processing for meditation soundscapes
- **Audio Context Management**: Proper audio lifecycle management for mobile devices
- **Real-time Processing**: Dynamic audio control during meditation sessions

## Data Layer

### Database Schema
```sql
-- Core tables
user_profiles         # User preferences and statistics
meditation_sessions   # Session history and progress tracking
```

### Data Management
- **Zod 4.x**: Runtime type validation and schema parsing
- **Type-safe Queries**: Full TypeScript integration with Supabase
- **Optimistic Updates**: Immediate UI updates with fallback handling

## Common Development Commands

### Development
```bash
npm run dev              # Start development server with Turbopack
npm run build           # Production build with optimization
npm run start           # Production server
```

### Code Quality
```bash
npm run lint            # Run ESLint checks
npm run lint:fix        # Auto-fix linting issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without changes
```

### Testing
```bash
npm test               # Run Jest test suite
npm run test:watch     # Run tests in watch mode
```

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development
NODE_ENV=development|production
```

### Port Configuration
- **Development Server**: 3000 (Next.js default)
- **Supabase Local**: 54321 (if using local development)
- **Database**: 5432 (PostgreSQL default via Supabase)

## Performance & Optimization

### Build Optimization
- **Automatic Code Splitting**: Route-based chunks for faster loading
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Analysis**: Built-in bundle analyzer for size monitoring
- **Tree Shaking**: Dead code elimination in production builds

### Runtime Performance
- **React 19 Concurrent Features**: Better user experience with concurrent rendering
- **Framer Motion**: Hardware-accelerated animations using transform properties
- **Efficient Re-renders**: Proper hook dependencies and memo usage patterns

## Security Considerations

### Client-Side Security
- **Environment Variable Separation**: Public vs private environment variables
- **XSS Prevention**: React's built-in XSS protection with proper data handling
- **Content Security Policy**: Configured for production deployment

### Database Security
- **Row Level Security**: User data isolation at database level
- **JWT Validation**: Automatic token validation for all database requests
- **SQL Injection Prevention**: Parameterized queries via Supabase client

## Deployment Architecture

### Hosting Recommendations
- **Vercel**: Optimal Next.js deployment with edge functions
- **Netlify**: Alternative with good Next.js support
- **Traditional VPS**: Docker-based deployment for custom infrastructure

### Production Configuration
- **Environment-specific builds**: Separate staging and production environments
- **Database Migrations**: Managed through Supabase dashboard
- **Monitoring**: Application and database performance monitoring