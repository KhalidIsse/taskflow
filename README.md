# TaskFlow

A small drag-and-drop task board. Next.js 15 (App Router), Tailwind CSS 4, Auth.js v5 (Google + GitHub), MongoDB with Mongoose, dnd-kit.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and fill it in.

   - `MONGODB_URI`: a local MongoDB or a MongoDB Atlas connection string
   - `AUTH_SECRET`: run `openssl rand -base64 32`
   - Google OAuth: create credentials in Google Cloud Console, with the redirect URI
     `http://localhost:3000/api/auth/callback/google`
   - GitHub OAuth: create an OAuth app, with the callback URL
     `http://localhost:3000/api/auth/callback/github`

3. Run it

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## How it fits together

| Area | Where |
|---|---|
| Pages | `app/page.tsx`, `app/login`, `app/register`, `app/dashboard` |
| Auth (login, register, logout) | `auth.ts`, `auth.config.ts`, `app/api/auth/[...nextauth]` |
| Route protection | `middleware.ts` guards `/dashboard`; every action and API route also checks the session |
| Models | `models/User.ts`, `models/Task.ts` |
| Shared task logic | `lib/tasks.ts` (always filters by `userId`) |
| Server actions (used by the UI) | `app/actions.ts` |
| REST API (same logic) | `app/api/tasks`, `app/api/tasks/[id]` |
| Validation | `lib/validation.ts` (Zod, used in forms, actions and API) |
| Kanban board | `components/Board.tsx`, `components/TaskForm.tsx` |

## Notes

- "Register" is sign-up with Google or GitHub; Auth.js creates the user on first sign-in.
- Dragging updates the UI immediately and rolls back with a message if the server rejects the move.
- Keyboard: focus a card, press Space to lift it, arrow keys to move, Space to drop.
- API: `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/:id` (signed-in session cookie required).
