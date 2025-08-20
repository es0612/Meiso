# Suggested Development Commands

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Testing
```bash
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

### Git Hooks
```bash
npm run prepare      # Set up Husky git hooks
```

## Darwin (macOS) System Commands
- `ls` - List directory contents
- `cd` - Change directory
- `find` - Find files and directories
- `grep` - Search text patterns
- `git` - Version control
- `npm` - Package manager
- `node` - Run Node.js

## Environment Setup
- Node.js and npm required
- Environment variables in `.env.local` (not committed)
- Supabase project setup required for database functionality

## Key Directories
- `meiso/` - Main application directory
- `meiso/src/` - Source code
- `meiso/public/` - Static assets
- `meiso/supabase/` - Database schema

## Pre-commit Hooks (lint-staged)
- Automatically runs ESLint and Prettier on staged files
- Formats JSON, CSS, and Markdown files
- Ensures code quality before commits