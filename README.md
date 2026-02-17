#  Bookmark Manager

A clean, production-ready Bookmark Manager built with **Next.js**, **Supabase**, and **Google OAuth**.

Users can securely log in, add bookmarks, delete them, and see instant updates across multiple tabs — no WebSockets needed.

---

##  Screenshots

> **Login Page**

![Login Page Screenshot](screenshots/login.png)

> **Dashboard / Bookmarks View**

![Dashboard Screenshot](screenshots/dashboard.png)

---

##  Features

-  Google OAuth Authentication
-  Secure Row-Level Security (RLS) via Supabase
-  Create & ❌ Delete Bookmarks
-  Optimistic UI Updates
-  Cross-Tab Instant Sync
-  Protected Routes

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Google OAuth (via Supabase) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |

---

##  Architecture Decisions

### 1. Authentication

Google OAuth is enabled via Supabase. The session is verified on every page load, and unauthorized users are automatically redirected to `/login`.

### 2. Database Security

Row-Level Security (RLS) is enabled on all tables. Policies ensure each user can only read and write their own bookmarks. This was verified by testing with multiple Google accounts simultaneously.

### 3. Cross-Tab Sync (No WebSockets)

Instead of relying on Supabase Realtime (WebSockets), this app uses a lighter, more stable approach:

- `localStorage` broadcast events
- `storage` event listeners
- Focus + visibility fallback fetch on tab switch

**Why this approach?**

- Avoids WebSocket connection instability
- Prevents duplicate data from mixed optimistic + realtime updates
- Ensures instant UI sync across tabs
- Keeps the app lightweight and predictable

---

##  Problems Faced & Solutions

### 1. Duplicate Bookmarks Appearing

**Problem:** Realtime updates combined with optimistic updates caused duplicate entries to appear in the list.

**Solution:** Removed the Supabase Realtime dependency and added explicit duplicate checks before updating local state.

---

### 2. Realtime WebSocket Instability

**Problem:** WebSocket connections frequently closed or timed out, especially across multiple open tabs.

**Solution:** Replaced Supabase Realtime entirely with a `localStorage`-based cross-tab sync strategy combined with focus/visibility event fallbacks.

---

### 3. Authentication State Not Syncing Across Tabs

**Problem:** Logging in from one tab did not immediately reflect the authenticated state in another open tab.

**Solution:** Used Supabase's `onAuthStateChange` listener with proper redirect handling to keep auth state consistent across all tabs.

---

##  How to Run Locally

**1. Clone the repository:**

```bash
git clone https://github.com/your-username/bookmark-manager
cd bookmark-manager
```

**2. Set up environment variables:**

Create a `.env.local` file in the root directory and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**3. Install dependencies and start the dev server:**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Deployment

This project is deployed on **Vercel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

##  License

This project is open source and available under the [MIT License](LICENSE).