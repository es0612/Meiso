# Project Structure & Code Organization

## Root Directory Organization

```
Meiso/
├── .kiro/                  # Kiro spec-driven development files
│   ├── specs/             # Feature specifications and tasks
│   └── steering/          # Project steering documents (this file)
├── .claude/               # Claude Code configuration and commands
├── meiso/                 # Main application directory
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── supabase/          # Database schema and migrations
│   └── [config files]    # Build and development configuration
├── CLAUDE.md              # Claude Code instructions and workflow
└── README.md              # Project documentation
```

## Source Code Architecture

### Component-Based Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Route groups for organization
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Route page components
├── components/            # React components by domain
│   ├── ui/               # Reusable UI primitives
│   ├── meditation/       # Meditation-specific components
│   ├── audio/            # Audio control components
│   ├── auth/             # Authentication components
│   └── layout/           # Layout and navigation components
├── lib/                  # Core business logic libraries
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Pure utility functions
├── constants/            # Application constants
└── contexts/             # React context providers
```

## File Naming Conventions

### Components
- **Format**: PascalCase (e.g., `MeditationTimer.tsx`)
- **Folder Structure**: Components can be organized in folders using kebab-case
- **Index Files**: Each component directory includes `index.ts` for clean imports

```tsx
// components/meditation/MeditationTimer.tsx
export const MeditationTimer: FC<MeditationTimerProps> = ({ ... }) => {
  // Component implementation
};

// components/meditation/index.ts
export { MeditationTimer } from './MeditationTimer';
export { MeditationSessionController } from './MeditationSessionController';
```

### Hooks
- **Format**: camelCase with `use` prefix (e.g., `useMeditationTimer.ts`)
- **Organization**: Domain-specific hooks grouped by functionality
- **Testing**: Co-located test files in `__tests__/` directories

### Utilities
- **Format**: camelCase (e.g., `formatTime.ts`, `errorHandling.ts`)
- **Principle**: Pure functions without side effects
- **Exports**: Named exports for tree-shaking optimization

### Types
- **Format**: PascalCase (e.g., `MeditationSession.ts`)
- **Convention**: No `I` prefix for interfaces (use descriptive names)
- **Organization**: Grouped by domain with shared types in `types/index.ts`

### Constants
- **Format**: UPPER_SNAKE_CASE (e.g., `MEDITATION_DURATIONS.ts`)
- **Structure**: Object exports with `as const` assertions for type safety

## Import Organization Standards

### Import Order
```tsx
import { FC, useState } from 'react';              // 1. React core
import { motion } from 'framer-motion';            // 2. External libraries

import { Button } from '@/components/ui/Button';   // 3. Internal components
import { formatTime } from '@/utils/formatTime';   // 4. Utilities
import { MeditationSession } from '@/types';       // 5. Types

import './ComponentName.css';                      // 6. Relative imports (if any)
```

### Path Aliases
- **@/**: Points to `src/` directory for absolute imports
- **Consistent Usage**: Always use absolute imports for internal modules
- **TypeScript Configuration**: Configured in `tsconfig.json` for IDE support

## Component Architecture Patterns

### Standard Component Structure
```tsx
import { FC } from 'react';

interface ComponentNameProps {
  // Props interface using descriptive names
  duration: number;
  onComplete: () => void;
  className?: string; // Optional styling override
}

export const ComponentName: FC<ComponentNameProps> = ({
  duration,
  onComplete,
  className,
}) => {
  // 1. Hooks and state
  const [isActive, setIsActive] = useState(false);
  
  // 2. Derived state and computations
  const formattedTime = formatTime(duration);
  
  // 3. Event handlers
  const handleComplete = () => {
    setIsActive(false);
    onComplete();
  };
  
  // 4. Render
  return (
    <div className={clsx('default-styles', className)}>
      {/* Component JSX */}
    </div>
  );
};
```

### Custom Hook Patterns
```tsx
// hooks/useMeditationSession.ts
export const useMeditationSession = (scriptId: string) => {
  // 1. State management
  const [session, setSession] = useState<MeditationSession | null>(null);
  
  // 2. Effects and lifecycle
  useEffect(() => {
    // Side effects
  }, [scriptId]);
  
  // 3. API methods
  const startSession = useCallback(() => {
    // Implementation
  }, []);
  
  // 4. Return API
  return {
    session,
    startSession,
    // ... other methods
  };
};
```

## Testing Architecture

### Test File Organization
```
src/
├── components/
│   └── meditation/
│       ├── MeditationTimer.tsx
│       └── __tests__/
│           ├── MeditationTimer.test.tsx          # Unit tests
│           └── MeditationTimer.integration.test.tsx # Integration tests
├── hooks/
│   └── __tests__/
│       └── useMeditationSession.test.ts
└── utils/
    └── __tests__/
        └── errorHandling.test.ts
```

### Test Naming Conventions
- **Unit Tests**: `ComponentName.test.tsx`
- **Integration Tests**: `ComponentName.integration.test.tsx`
- **Utility Tests**: `functionName.test.ts`

### Test Structure Pattern
```tsx
// __tests__/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly with default props', () => {
    // Test implementation
  });
  
  it('handles user interactions', () => {
    // Test implementation
  });
});
```

## Configuration File Organization

### Build Configuration
- **next.config.ts**: Next.js configuration with TypeScript
- **tsconfig.json**: TypeScript compiler configuration
- **tailwind.config.js**: Tailwind CSS customization
- **postcss.config.mjs**: PostCSS configuration for Tailwind

### Development Tools
- **eslint.config.mjs**: ESLint rules and parser configuration
- **jest.config.js**: Jest testing framework configuration
- **jest.setup.js**: Test environment setup
- **.prettierrc**: Code formatting rules

## Key Architectural Principles

### Separation of Concerns
- **Presentation Components**: Focus on UI rendering with minimal logic
- **Container Components**: Handle data fetching and business logic
- **Custom Hooks**: Encapsulate stateful logic for reuse
- **Utility Functions**: Pure functions for data transformation

### Data Flow Architecture
- **Unidirectional Data Flow**: Props down, callbacks up pattern
- **Context for Global State**: Authentication and theme state
- **Local State for Component State**: UI-specific state management
- **Server State**: Managed through Supabase client with caching

### Error Handling Patterns
- **Boundary Components**: Error boundaries for component tree isolation
- **Utility Functions**: Centralized error handling and reporting
- **User Feedback**: Consistent error message presentation
- **Graceful Degradation**: Fallback UI for error states

### Performance Considerations
- **Code Splitting**: Route-based splitting with Next.js
- **Lazy Loading**: Dynamic imports for non-critical components
- **Memoization**: Strategic use of `useMemo` and `useCallback`
- **Bundle Optimization**: Tree shaking and dead code elimination

## Documentation Standards

### Component Documentation
```tsx
/**
 * MeditationTimer provides a countdown timer for meditation sessions
 * with pause/resume functionality and visual progress indication.
 *
 * @example
 * <MeditationTimer
 *   duration={300}
 *   onComplete={() => console.log('Session completed')}
 * />
 */
export const MeditationTimer: FC<MeditationTimerProps> = ({ ... }) => {
  // Implementation
};
```

### README Standards
- **Component READMEs**: Usage examples and API documentation
- **Domain READMEs**: High-level overview of component groups
- **Setup Documentation**: Clear setup and development instructions

This structure supports maintainable, scalable code while enabling efficient development workflows and clear separation of concerns across the meditation application.