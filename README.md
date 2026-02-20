# Sunflower CFM

Community Feedback Management platform for Sunflower Organization. Used to receive, track, and manage feedback and complaints from communities across the Occupied Palestinian Territories (OPT).

Built by Ahmad Spierij.

## What this is

A web application that handles the full lifecycle of community feedback. People submit feedback (complaints, suggestions, whatever), the team classifies it, assigns it to someone, tracks it through investigation and resolution, and closes it out. Everything gets logged.

The platform has a public side where anyone can submit feedback without an account, and a staff portal where the team manages cases.

## Tech stack

Backend: Node.js, Express 5, MS SQL Server, Azure Blob Storage for file uploads, Nodemailer for emails.

Frontend: React 19, Vite, styled-components, React Router, React Query, React Hook Form, Recharts for charts.

## Project structure

```
sunflower_cfm/
  server.js            - Express server entry point
  backend/
    config/            - Database, email config, initial data seeding
    controllers/       - Route handlers (auth, cases, feedback, users, etc.)
    middlewares/       - Authentication, authorization, file upload, validation
    models/            - Database models (Case, Feedback, User, Notifications, etc.)
    routes/            - API route definitions
    services/          - Azure storage, email service, permissions
    utils/             - Helper functions
  frontend/
    src/
      pages/           - Page components (Dashboard, Cases, AddCase, etc.)
      features/        - Feature modules (auth, cases, dashboard, notifications, profile)
      ui/              - Reusable UI components (Button, Input, Card, Modal, Table, etc.)
      contexts/        - React contexts (Auth, Theme, Toast)
      hooks/           - Custom hooks
      services/        - API service functions
      styles/          - Global styles with CSS custom properties
```

## Main features

- Multi-channel feedback collection (phone, in-person, online, hotline, social media, partner referral)
- Case lifecycle management (create, classify, assign, investigate, resolve, close)
- Role-based access (admin, supervisor, user) with granular permissions
- Geographic hierarchy (Region > Governorate > Community) for location tracking
- Configurable resources: categories, statuses, priorities, channels, programs, projects, activities, provider types
- Hierarchical resource management for programs/projects/activities and geography
- Notification system (in-app and email)
- Case timeline and audit trail (every action gets logged)
- Dashboard with statistics and charts
- Email verification, password reset, account lockout
- Dark mode support
- Public landing page and public feedback submission form

## How to run

You need Node.js and a SQL Server database. Create a `.env` file with your database connection details, JWT secret, email config, and Azure storage keys.

```
npm install
npm install --prefix frontend
```

Development (runs server with nodemon):
```
npm run dev
```

Frontend dev server:
```
npm run client
```

Production build:
```
npm run build
npm start
```

## Public pages

The app has a public section at `/home` with:
- Landing page at `/home`
- Feedback submission form at `/home/submit-feedback` (no account needed)
- About page at `/home/about`

Staff portal is behind authentication at `/dashboard`, `/cases`, `/users`, etc.

## API routes

All API routes are under `/api/`. Authentication is handled via JWT tokens in HTTP-only cookies.

- `/api/auth/` - login, register, verify email, forgot/reset password
- `/api/users/` - user management (admin)
- `/api/cases/` - case CRUD, comments, history, notifications
- `/api/feedback/` - feedback management
- `/api/my-profile/` - current user profile
- `/api/notifications/` - notification management
- `/api/feedback-related-data/` - reference data (categories, statuses, priorities, etc.)

## Status

Active development. The case management system is functional. Dashboard, notifications, resource management, user management, and the public pages are all in place. Some features like SLA monitoring and analytics reports are still being built.
