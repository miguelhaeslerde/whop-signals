# Whop Trading Signals App

A complete trading signals platform designed to be embedded as a Whop app. Allows admins to create and send trading signals to subscribers with real-time notifications and performance tracking.

## Features

- **Role-based Access**: Admin/Owner can compose signals, subscribers can view
- **Real-time Signal Feed**: Live updates every 30 seconds
- **Signal Validation**: Built-in R/R ratio calculations and price level validation
- **Whop Integration**: Dynamic branding and user authentication via Whop SDK
- **Mobile Responsive**: Optimized for all devices
- **Clean UI**: Modern interface with shadcn/ui components

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: Vercel Postgres + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Authentication**: Whop SDK
- **Deployment**: Vercel

## Deployment Instructions

### 1. Whop App Setup

1. Go to [Whop Developer Portal](https://dev.whop.com)
2. Create a new app
3. Set the app type to "Iframe App"
4. Configure app permissions:
   - Read user data
   - Send notifications
   - Webhook access
5. Get your API key and webhook secret

### 2. GitHub Repository

1. Create a new GitHub repository
2. Push this code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```

### 3. Vercel Deployment

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables:
   - `WHOP_API_KEY`: Your Whop API key
   - `WHOP_WEBHOOK_SECRET`: Your Whop webhook secret
   - `DATABASE_URL`: Will be auto-generated with Vercel Postgres
   - `NODE_ENV`: production

### 4. Database Setup

1. In Vercel dashboard, go to Storage tab
2. Create a new Postgres database
3. The DATABASE_URL will be automatically added to your environment variables
4. The database tables will be created automatically on first deployment

### 5. Whop Webhook Configuration

1. In your Whop app settings, set the webhook URL to:
   `https://your-app-domain.vercel.app/api/whop/webhook`
2. Enable these webhook events:
   - `membership_created`
   - `membership_updated` 
   - `membership_deleted`

### 6. Whop App Configuration

1. Set the iframe URL to: `https://your-app-domain.vercel.app`
2. Configure frame security settings
3. Test the app in Whop's preview mode

## Environment Variables

```env
WHOP_API_KEY=your_whop_api_key_here
WHOP_WEBHOOK_SECRET=your_whop_webhook_secret_here
DATABASE_URL=your_vercel_postgres_url_here
NODE_ENV=production
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in your actual values
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/signals` - Get signals feed
- `POST /api/signals` - Create new signal (admin only)
- `POST /api/signals/:id/read` - Mark signal as read
- `GET /api/user/profile` - Get user profile
- `POST /api/whop/webhook` - Whop webhook handler

## Security

- CSP headers configured for Whop iframe embedding
- Rate limiting on signal creation
- Role-based access control
- Webhook signature verification

## Support

For issues or questions, contact support or check the documentation.