# Project Overview

## Project Purpose
Meiso (瞑想) is a meditation app designed specifically for busy business professionals. It provides short 1-minute meditation sessions that can fit into busy schedules, helping users reduce stress and improve focus during their spare time.

## Tech Stack
- **Framework**: Next.js 15.4.6 with App Router
- **Frontend**: React 19.1.0, TypeScript 5
- **Styling**: Tailwind CSS 4, Framer Motion for animations
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth (supports email and anonymous users)
- **State Management**: React Context API
- **Testing**: Jest with Testing Library
- **Build Tools**: Next.js with Turbopack
- **Linting/Formatting**: ESLint, Prettier
- **Package Manager**: npm

## Key Features
- 1-minute meditation sessions with audio guidance
- Progress tracking and meditation history
- Anonymous user support for quick start
- User profiles with customizable settings
- Dark/light theme support
- Mobile-responsive design

## Architecture
- Next.js App Router architecture
- Component-based design with TypeScript
- Supabase for backend services and real-time data
- Row Level Security (RLS) for data protection
- Custom hooks for state management
- Utility functions for common operations