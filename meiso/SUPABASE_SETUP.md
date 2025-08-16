# Supabase Setup Instructions

This document provides step-by-step instructions for setting up Supabase for the Meiso meditation app.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com and sign in to your account
2. Click "New Project"
3. Choose your organization
4. Fill in the project details:
   - **Name**: `meiso-meditation` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - Keep this secret!

## Step 3: Configure Environment Variables

1. In your project root, update the `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the contents of `supabase/schema.sql` from this project
3. Paste it into the SQL Editor and click "Run"
4. This will create:
   - `user_profiles` table for storing user preferences and statistics
   - `meditation_sessions` table for storing meditation session data
   - Row Level Security (RLS) policies for data protection
   - Indexes for better performance
   - Triggers for automatic profile creation

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Configure the following settings:

### Site URL
- Set your site URL (e.g., `http://localhost:3000` for development)

### Auth Providers
- **Email**: Enable email authentication
- **Anonymous**: Enable anonymous sign-ins for guest users

### Email Templates (Optional)
- Customize the email templates for password reset, email confirmation, etc.

## Step 6: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. The app should now be able to connect to Supabase
3. Check the browser console for any connection errors
4. Try creating a test meditation session to verify the database connection

## Step 7: Production Setup

For production deployment:

1. Create a separate Supabase project for production
2. Update your production environment variables
3. Configure your production domain in Supabase Auth settings
4. Set up proper CORS settings if needed

## Security Notes

- Never commit your `.env.local` file to version control
- The `service_role` key should only be used server-side
- The `anon` key is safe to use client-side
- RLS policies are configured to ensure users can only access their own data
- Anonymous users can create sessions but they're not linked to any user account

## Troubleshooting

### Connection Issues
- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure your site URL is configured in Supabase Auth settings

### RLS Policy Issues
- Make sure RLS is enabled on your tables
- Verify that your policies allow the operations you're trying to perform
- Check the Supabase logs for detailed error messages

### Anonymous User Issues
- Ensure anonymous authentication is enabled in your Supabase project
- Check that your RLS policies allow operations for `user_id IS NULL`

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)