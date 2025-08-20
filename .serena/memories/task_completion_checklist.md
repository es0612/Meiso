# Task Completion Checklist

## When a task is completed, run these commands in order:

### 1. Code Quality Checks
```bash
npm run lint         # Check for linting issues
npm run lint:fix     # Fix auto-fixable linting issues
npm run format       # Format code with Prettier
```

### 2. Testing
```bash
npm test             # Run all tests to ensure nothing is broken
```

### 3. Build Verification
```bash
npm run build        # Ensure the application builds successfully
```

## Pre-commit Verification
- Git hooks will automatically run lint and format checks
- All staged files will be processed through lint-staged
- TypeScript compilation is checked during build

## Additional Considerations
- Check that environment variables are properly configured
- Verify Supabase connection if database changes were made
- Test in both development and production builds
- Ensure responsive design works on different screen sizes
- Verify dark/light theme compatibility if UI changes were made

## Manual Testing
- Test critical user flows (meditation session creation, timer functionality)
- Verify authentication works for both logged-in and anonymous users
- Check that data persistence works correctly with Supabase

## Before Deployment
- Ensure all environment variables are set for production
- Verify Supabase production configuration
- Test with production build locally