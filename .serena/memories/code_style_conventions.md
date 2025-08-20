# Code Style and Conventions

## File Naming Rules

### Components
- **PascalCase**: `MeditationTimer.tsx`
- **Folders**: `meditation-timer/` (kebab-case)

### Hooks
- **camelCase**: `useMeditationTimer.ts`
- **Prefix**: Always start with `use`

### Utilities
- **camelCase**: `formatTime.ts`
- **Pure functions**: No side effects

### Type Definitions
- **PascalCase**: `MeditationSession.ts`
- **No prefix**: Don't use `I` prefix for interfaces

### Constants
- **UPPER_SNAKE_CASE**: `MEDITATION_DURATIONS.ts`

## Component Structure
```tsx
// Standard component structure
import { FC } from 'react';

interface ComponentNameProps {
  prop: type;
}

export const ComponentName: FC<ComponentNameProps> = ({ prop }) => {
  // Component logic
  return <div>{/* JSX */}</div>;
};
```

## Import Order
1. React related imports
2. External libraries
3. Internal components
4. Utilities
5. Type definitions
6. Relative imports

## Code Style Settings (Prettier)
- Semi-colons: true
- Trailing commas: es5
- Single quotes: true
- Print width: 80
- Tab width: 2
- Use tabs: false
- Bracket spacing: true
- Arrow parens: avoid
- End of line: lf

## ESLint Configuration
- Extends Next.js core web vitals and TypeScript configs
- Follows Next.js best practices
- TypeScript strict mode enabled

## Project Structure
```
src/
├── app/                    # Next.js App Router
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── meditation/       # Meditation-related components
│   └── audio/            # Audio-related components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Helper functions
└── constants/            # Constant definitions
```