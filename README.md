# TaskFlow — Production-Ready Task Management Application

A secure, full-stack task management application built with Next.js 14, MongoDB, and JWT authentication.

## 🏗️ Architecture Overview

The system follows a modern Next.js 14 App Router architecture:
- **Serverless API Routes**: Hosted within `app/api/...` which leverage Mongoose for MongoDB data interactions. They are structured into `auth` (user management) and `tasks` (CRUD logic).
- **Edge Middleware**: Next.js `middleware.ts` runs at the edge to verify JWT tokens via the edge-compatible `jose` library, protecting dashboard routes and automatically managing authenticated redirections.
- **Frontend App Router**: Provides Client-Side dynamic components for interactivity (e.g., managing tasks). Global layouts (`layout.tsx`) encompass the root structure, while page routes (`dashboard/page.tsx`, `login/page.tsx`) render the specific UIs.
- **Lib Abstractions**: Core logic like database connection (`db.ts`), JWT handling (`jwt.ts`), payload validation with Zod (`validations.ts`), and standardized HTTP responses (`response.ts`) are decoupled into the `lib/` directory to maximize reusability.

```text
taskflow/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts   # POST: User registration
│   │   │   ├── login/route.ts      # POST: User login
│   │   │   ├── logout/route.ts     # POST: Logout (clears cookie)
│   │   │   └── me/route.ts         # GET: Current user
│   │   └── tasks/
│   │       ├── route.ts            # GET (list w/ pagination) | POST (create)
│   │       └── [id]/route.ts       # GET | PATCH | DELETE (by ID)
│   ├── dashboard/page.tsx          # Protected: task management UI
│   ├── login/page.tsx              # Auth: login form
│   ├── register/page.tsx           # Auth: registration form
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── lib/
│   ├── db.ts                       # MongoDB connection (singleton)
│   ├── jwt.ts                      # JWT sign/verify + cookie management
│   ├── crypto.ts                   # AES-256 encryption/decryption
│   ├── auth.ts                     # Auth middleware helper
│   ├── validations.ts              # Zod schemas for all inputs
│   ├── response.ts                 # Standardized API response helpers
│   └── models/
│       ├── User.ts                 # Mongoose User model
│       └── Task.ts                 # Mongoose Task model
└── middleware.ts                   # Next.js route protection
```

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| Password Hashing | bcryptjs with salt rounds = 12 |
| JWT Auth | jose (Edge runtime compatible), 7-day expiry |
| Secure Cookies | HttpOnly, Secure (prod), SameSite=Strict |
| Input Validation | Zod schemas on all endpoints |
| Authorization | Per-request user ownership checks |
| AES Encryption | crypto-js AES-256 for sensitive fields |
| Injection Prevention | Mongoose ODM + regex escaping for search |
| User Enumeration | Generic error messages on login |
| Route Protection | Next.js middleware + server-side JWT verify |

## 🚀 Quick Start Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-secret-jwt-key-at-least-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key!
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

Generate secure keys (if not using the default examples):
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Encryption Key (must be exactly 32 chars for AES-256)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Run development server
```bash
npm run dev
```

Visit http://localhost:3000

### 5. Build for production
```bash
npm run build
npm start
```

---

## 📡 API Reference & Sample Documentation

For complete API documentation including request/response examples for authentication and task management endpoints, please refer to the [API Documentation](API.md).

---

## 🧰 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jose for Edge support) + bcryptjs
- **Validation**: Zod
- **Encryption**: crypto-js (AES-256)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready
