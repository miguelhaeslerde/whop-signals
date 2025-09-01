# Overview

This is a full-stack trading signals application built with React, Express, and PostgreSQL. The application allows administrators to create and send trading signals to subscribers, with real-time notifications and performance tracking. It integrates with Whop for membership management and user authentication.

The application features a modern UI built with shadcn/ui components, real-time signal updates, risk management tools, and comprehensive analytics for tracking signal performance.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Whop SDK integration for user authentication and membership management

## Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between client and server
- **Session Management**: In-memory storage with plans for PostgreSQL sessions
- **Rate Limiting**: Custom middleware for API protection

## Database Design
- **Primary Database**: PostgreSQL with Neon as the serverless provider
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**:
  - `users`: User profiles linked to Whop membership data
  - `signals`: Trading signals with entry, stop loss, and take profit levels
  - `signal_reads`: Tracking which users have read which signals
  - `audit_logs`: System activity logging for compliance and debugging

## Authentication & Authorization
- **Provider**: Whop SDK for membership-based authentication
- **Role System**: Two-tier system (ADMIN/SUBSCRIBER) with role-based access control
- **Session Handling**: Whop context management with fallback to mock data in development
- **Access Control**: Route-level protection based on user roles

## Real-time Features
- **Signal Updates**: React Query with automatic refetching every 30 seconds
- **Notifications**: Whop SDK notification system for signal alerts
- **Live Status**: Visual indicators for real-time signal feed status

## Data Validation
- **Shared Schemas**: Zod schemas in `/shared` directory used by both client and server
- **Form Validation**: Client-side validation with server-side verification
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Price Validation**: Trading-specific validation for price levels and risk ratios

## Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Hot Reload**: Vite HMR for instant development feedback
- **Error Handling**: Custom error overlays and comprehensive error boundaries

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Whop SDK for membership management and user authentication
- **Build Tool**: Vite with React plugin for frontend development
- **Replit Integration**: Custom plugins for Replit development environment

## UI and Styling
- **Component Library**: Radix UI primitives with shadcn/ui wrapper components
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React icon library
- **Fonts**: Google Fonts (Poppins, DM Sans, Fira Code, Geist Mono)

## Data Management
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **HTTP Client**: Native Fetch API with TanStack React Query
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for runtime type checking and validation

## Development Dependencies
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast JavaScript bundling for production
- **Date Handling**: date-fns for date manipulation and formatting
- **Utilities**: clsx and tailwind-merge for conditional styling