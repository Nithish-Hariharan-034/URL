
# Snip — Advanced URL Shortener & Analytics Platform

A modern, production-style full-stack URL shortener platform built with a scalable monorepo architecture using React, Express, PostgreSQL, TypeScript, and OpenAPI-driven development.

This application allows users to create shortened URLs, track click analytics in real time, generate QR codes, manage links from a responsive dashboard, and visualize traffic trends through interactive charts.

---

# 🚀 Features

## 🔐 Authentication
- User registration and login
- JWT-based authentication
- Password hashing using bcryptjs
- Protected dashboard and analytics routes
- Automatic token injection via custom fetch wrapper

---

## 🔗 URL Shortening
- Shorten long URLs instantly
- Generate unique 6-character short codes using nanoid
- Optional custom aliases
- Expiry date support for links
- Expired links return HTTP `410 Gone`

---

## 📊 Analytics
- Track total clicks
- Record:
  - Timestamp
  - IP address
  - Browser/User-Agent
- Daily click trend visualization using Recharts
- Recent visit history table
- Last visited timestamp

---

## 🎨 Modern Frontend UI
- React + Vite SPA
- Tailwind CSS + shadcn/ui components
- Responsive mobile-first design
- Toast notifications
- Loading states and validation
- QR code generation support
- Dashboard statistics cards

---

## 🏗️ Monorepo Architecture
- pnpm workspaces
- Shared TypeScript configuration
- Shared API contracts
- Shared Zod schemas
- Shared database layer

---

# 🛠️ Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- React Hook Form
- TanStack Query
- Wouter

## Backend
- Node.js
- Express 5
- JWT Authentication
- bcryptjs
- nanoid
- Zod Validation

## Database
- PostgreSQL
- Drizzle ORM
- drizzle-zod

## Tooling
- TypeScript
- pnpm Workspaces
- OpenAPI
- Orval Code Generation
- esbuild

---

# 📁 Project Structure

```bash
URL-Enhancer/
│
├── artifacts/
│   ├── api-server/           # Express backend
│   ├── url-shortener/        # React frontend
│
├── lib/
│   ├── api-client-react/     # Auto-generated frontend API hooks
│   ├── api-spec/             # OpenAPI specification
│   ├── api-zod/              # Shared Zod schemas
│   └── db/                   # Database schema and ORM
│
├── scripts/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

# ⚙️ How the Application Works

## 1. User Authentication Flow

```text
User Login/Register
        ↓
Express API validates credentials
        ↓
JWT Token generated
        ↓
Stored in localStorage as snip_token
        ↓
Automatically attached to API requests
```

---

## 2. URL Shortening Flow

```text
User enters long URL
        ↓
Backend validates URL
        ↓
nanoid generates short code
        ↓
Saved in PostgreSQL
        ↓
Short URL returned to frontend
```

Example:

```text
Original URL:
https://google.com

Short URL:
https://domain.com/s/abc123
```

---

## 3. Redirect & Analytics Flow

```text
User visits short URL
        ↓
Server finds original URL
        ↓
Click data recorded
  - IP Address
  - User Agent
  - Timestamp
        ↓
Redirect to original URL
```

---

# 🗄️ Database Schema

## Users Table
| Column | Type |
|---|---|
| id | UUID |
| email | String |
| password | String |
| createdAt | Timestamp |

---

## Short URLs Table
| Column | Type |
|---|---|
| id | UUID |
| userId | UUID |
| originalUrl | Text |
| shortCode | String |
| customAlias | String |
| expiresAt | Timestamp |
| createdAt | Timestamp |

---

## Clicks Table
| Column | Type |
|---|---|
| id | UUID |
| shortUrlId | UUID |
| timestamp | Timestamp |
| ipAddress | String |
| userAgent | String |

---

# 📡 API Overview

## Authentication Routes

### Register
```http
POST /api/auth/register
```

### Login
```http
POST /api/auth/login
```

---

## URL Routes

### Create Short URL
```http
POST /api/urls
```

### Get User URLs
```http
GET /api/urls
```

### Delete URL
```http
DELETE /api/urls/:id
```

### URL Analytics
```http
GET /api/urls/:id/analytics
```

---

## Redirect Route

```http
GET /s/:shortCode
```

---

# 🧠 OpenAPI-Driven Development

This project follows an API-first architecture.

The OpenAPI specification is the single source of truth.

```bash
lib/api-spec/openapi.yaml
```

Used for:
- Backend route contracts
- Frontend API hooks
- Shared validation schemas
- Type-safe API communication

---

# 🔄 Code Generation

Whenever the API specification changes:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates:
- API hooks
- Zod schemas
- Frontend typings

---

# 🧪 Local Development Setup

## Prerequisites

Install:
- Node.js 20+
- pnpm
- PostgreSQL

---

# 📥 Installation

## Clone Repository

```bash
git clone <your-repo-url>
cd URL-Enhancer
```

---

## Install Dependencies

```bash
pnpm install
```

---

# 🔑 Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/url_enhancer
JWT_SECRET=your_secret_key
```

---

# ▶️ Running the Application

## Start Backend

```bash
pnpm --filter @workspace/api-server run dev
```

Backend runs on:

```text
http://localhost:8080
```

---

## Start Frontend

```bash
pnpm --filter @workspace/url-shortener run dev
```

Frontend runs on:

```text
http://localhost:21875
```

---

# 🧪 Type Checking

```bash
pnpm run typecheck
```

---

# 🏗️ Production Build

```bash
pnpm run build
```

---

# 📈 Analytics Dashboard

The analytics page includes:
- Total click count
- Last visited timestamp
- Daily traffic charts
- Recent visits table
- Browser tracking

Built using:
- Recharts
- TanStack Query
- Responsive UI cards

---

# 🔒 Security Practices

- JWT authentication
- Password hashing with bcryptjs
- Server-side validation using Zod
- Protected API routes
- Typed request validation
- Expiry validation for links
- Environment variables for secrets

---

# 📱 Responsive Design

The UI is fully responsive:
- Mobile devices
- Tablets
- Desktop screens

Built using:
- Tailwind CSS
- shadcn/ui
- Flex/Grid layouts

---

# 🏆 Key Engineering Decisions

## Why Monorepo?
To share:
- Types
- Validation schemas
- API contracts
- Utility logic

between frontend and backend efficiently.

---

## Why OpenAPI?
To maintain:
- API consistency
- Type safety
- Faster frontend integration
- Better scalability

---

## Why Drizzle ORM?
- Lightweight
- Type-safe
- SQL-like developer experience
- Excellent TypeScript support

---

# 🚀 Future Improvements

- CSV bulk URL shortening
- Geo-location analytics
- Dark mode
- Role-based access
- Redis caching
- Docker deployment
- OAuth login
- Custom domains

---

# 🌐 Deployment Suggestions

## Frontend
- Vercel

## Backend
- Render / Railway

## Database
- Neon PostgreSQL

---

# 👨‍💻 Author

Developed as a modern full-stack URL shortener and analytics platform showcasing:
- scalable architecture
- API-first development
- production-ready engineering practices
- advanced TypeScript monorepo structure

---

# 📜 License

MIT License

---

# 🙌 Acknowledgement

This project is a part of a hackathon run by https://katomaran.com
