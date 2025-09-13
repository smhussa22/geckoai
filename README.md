# 🦎 GeckoAI

# 🌐 https://future.domain

GeckoAI is an AI-powered assistant that helps students organize schedules, generate quizzes, and manage study materials effortlessly.  
It combines modern web technologies with AI to make productivity smarter and more intuitive.

---

## 🚀 Features

- 📅 **Smart Scheduling** – Connect with Google Calendar to create, edit, and track events.
- 🤖 **AI-Powered Learning** – Upload notes and generate quizzes or study questions with the Google Gemini API.
- ☁️ **Cloud Storage** – Securely store files with AWS S3.
- 🔑 **Authentication** – Simple sign-in with Google Identity API.
- 🎨 **Beautiful UI** – Responsive and animated interface powered by TailwindCSS + Framer Motion.

---

## 🧰 Tech Stack

- **Frontend:** Next.js, React, TypeScript, TailwindCSS, Framer Motion
- **Backend:** Prisma, Neon PostgreSQL
- **APIs & Services:**
  - Google Calendar API
  - Google Gemini API
  - Google Identity API
  - AWS S3

---

### ▶️ Steps to Run the Project Locally

### ✅ Prerequisites

Make sure you have the following installed before running GeckoAI:

- **Node.js** (v18+ recommended)  
  Check if you already have it:

```bash
node -v
```

### 📥 Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/geckoai.git
cd geckoai
```

2. Install the necessary packages

```bash
npm install
```

3. Create the following environment files:
   a) **.env** with the following keys:

```bash
DATABASE_URL=
PRISMA_MIGRATION_DATABASE_URL=
```

b) **.env.local** with the following keys:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_REDIRECT_URL=http://localhost:3000/taillink

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=

SESSION_SECRET=
```

4. Fill in the keys

### 🔑 Environment Keys – Quick Guide

- **Database (Neon PostgreSQL)**
  - `DATABASE_URL` – Connection string from your Neon project.
  - `PRISMA_MIGRATION_DATABASE_URL` – Same as above, or a separate DB URL for migrations.

- **Google APIs**
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – Create in [Google Cloud Console](https://console.cloud.google.com/), under **OAuth 2.0 Credentials**.
  - `GOOGLE_REDIRECT_URI` – Must match your OAuth redirect (default: `http://localhost:3000/api/auth/google/callback`).

- **Frontend URLs**
  - `NEXT_PUBLIC_BASE_URL` – Base URL for your app (local = `http://localhost:3000`).
  - `NEXT_PUBLIC_REDIRECT_URL` – Redirect after auth (e.g., `/taillink`).

- **AWS (S3 Storage)**
  - `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` – From **AWS IAM** → create user with programmatic access + S3 permissions.
  - `AWS_REGION` – The region your S3 bucket is hosted in (e.g., `us-east-1`).
  - `S3_BUCKET_NAME` – Your bucket’s name.

- **Auth**
  - `SESSION_SECRET` – A random string for signing JWTs (generate with: `openssl rand -base64 32`).

5. Once all keys are filled in, run the local server:

```bash
npm run dev
```

You can now open the localhost server and run the project locally.
