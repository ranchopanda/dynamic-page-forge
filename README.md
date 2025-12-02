# Mehendi

AI-powered bespoke henna design studio. Upload your hand, analyze your style, and visualize exquisite mehendi designs.

## Features

- **AI Hand Analysis** - Upload your hand photo for personalized design recommendations
- **Outfit Matching** - Match henna designs to your outfit colors and style
- **Design Generation** - Generate unique henna designs using Gemini AI
- **User Accounts** - Save designs, track bookings, manage profile
- **Artist Profiles** - Browse and book consultations with henna artists
- **Design Gallery** - Explore community designs for inspiration
- **Booking System** - Schedule consultations with email confirmations

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Nodemailer for emails

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### 2. Environment Setup

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key
```

**Backend (server/.env):**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mehendi"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### 3. Database Setup

```bash
cd server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed initial data
```

### 4. Run Development Servers

```bash
# From root directory - runs both frontend and backend
npm run dev:all

# Or run separately:
npm run dev          # Frontend on :3000
npm run server:dev   # Backend on :3001
```

## Project Structure

```
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── context/           # React context providers
│   ├── lib/               # Utilities (API client)
│   ├── services/          # Gemini AI service
│   └── types/             # TypeScript types
├── server/                 # Backend source
│   ├── prisma/            # Database schema & migrations
│   └── src/
│       ├── config/        # Configuration
│       ├── lib/           # Utilities (JWT, email, upload)
│       ├── middleware/    # Express middleware
│       └── routes/        # API routes
└── index.html             # Entry HTML
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update profile

### Designs
- `GET /api/designs/gallery` - Public gallery
- `GET /api/designs/my` - User's designs
- `POST /api/designs` - Save design
- `DELETE /api/designs/:id` - Delete design

### Bookings
- `GET /api/bookings/my` - User's bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/cancel` - Cancel booking

### Artists
- `GET /api/artists` - List artists
- `GET /api/artists/:id` - Artist profile
- `POST /api/artists/:id/review` - Submit review

### Styles
- `GET /api/styles` - List henna styles

## Default Accounts (after seeding)

- **Admin:** admin@mehendi.com / admin123
- **Artist:** priya@mehendi.com / artist123

## License

MIT
