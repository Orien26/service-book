# Client Service Book

A virtual service record system for real estate building maintenance businesses. Clients get a private portal to view their property's service history, photos, invoices, and communicate with their service provider.

## Features

- Admin uploads before/after photos, invoices, and job details
- Clients view only their own records (Row Level Security)
- Comment thread per job (append-only — nothing is ever deleted)
- Admin can soft-hide media items with a reason visible to clients
- 1-year service reminders via Google Calendar or .ics download
- Client self-registration via invite link

---

## Setup

### 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Note your **Project URL** and **anon public key** from **Settings → API**

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Paste the entire contents and click **Run**

This creates all tables, Row Level Security policies, and the auth trigger.

### 3. Set Your Admin Email

Before running the schema, open `supabase/schema.sql` and find this line near the bottom:

```sql
insert into public.app_config (key, value) values ('admin_email', 'REPLACE_WITH_YOUR_EMAIL');
```

Replace `REPLACE_WITH_YOUR_EMAIL` with the email you will use to sign up as admin. When you register with that email, your account is automatically assigned the `admin` role.

Alternatively, after running the schema you can update it in SQL Editor:

```sql
update public.app_config set value = 'your@email.com' where key = 'admin_email';
```

### 4. Create the Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**, name it `job-media`, and set it to **Private**
3. Go to **Policies** for this bucket and add these policies:

**Policy 1 — Admin full access:**
- Operation: All (SELECT, INSERT, UPDATE, DELETE)
- Target roles: `authenticated`
- Using expression:
```sql
(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
```

**Policy 2 — Client read own files:**
- Operation: SELECT
- Target roles: `authenticated`
- Using expression:
```sql
EXISTS (
  SELECT 1 FROM public.job_media jm
  JOIN public.jobs j ON j.id = jm.job_id
  JOIN public.clients c ON c.id = j.client_id
  JOIN public.profiles p ON p.id = c.profile_id
  WHERE p.id = auth.uid()
  AND jm.storage_path = name
)
```

### 5. Local Development

```bash
cd client-dashboard

# Copy environment file
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to Vercel (Free)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign up / log in
3. Click **Add New Project** → Import your GitHub repo
4. Set the **Root Directory** to `client-dashboard`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
6. Click **Deploy**

Vercel will give you a live URL like `https://your-app.vercel.app`.

---

## First-Use Flow

### Admin Setup

1. Go to your app URL and click **Create an account**
2. Sign up with the **exact email** you set in `app.admin_email` above
3. You will be automatically logged in as **Admin**

### Adding a Client

1. From the Admin dashboard, click **New client**
2. Fill in the client's name, property address, phone, email
3. After saving, click **Copy invite link** — this generates a unique registration link for that client

### Client Registration

1. Send the invite link to your client (e.g. `https://your-app.vercel.app/register?client=UUID`)
2. The client clicks the link, sets their name, email, and password
3. Their account is automatically linked to their property record
4. They can now log in at any time to view their service history

### Creating a Job

1. From Admin → Client page → click **New job**
2. Fill in job title, issue description, work done, parts replaced, dates, and invoice amount
3. After saving, use the **Before photos**, **After photos**, and **Invoice** sections to upload files
4. Mark the job as **Complete** when done — this enables the calendar reminder buttons for the client

---

## Supabase Auth Settings (Recommended)

In **Authentication → Settings**:

- Enable **Email confirmations**: OFF (optional — simplifies client onboarding)
- Set **Site URL** to your Vercel app URL
- Add your Vercel URL to **Redirect URLs**

---

## Project Structure

```
client-dashboard/
├── supabase/
│   └── schema.sql          # All tables, RLS policies, triggers
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx  # Auth state, roles, signIn/signUp/signOut
│   ├── lib/
│   │   ├── supabase.js      # Supabase client, file upload, signed URLs
│   │   └── calendar.js      # Google Calendar URL + .ics download
│   ├── components/
│   │   ├── Layout.jsx       # AdminLayout and ClientLayout
│   │   ├── MediaUpload.jsx  # Drag-and-drop file uploader
│   │   ├── MediaGallery.jsx # Photo/PDF viewer with hide support
│   │   └── CommentThread.jsx# Append-only chat thread
│   └── pages/
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── admin/
│       │   ├── Dashboard.jsx    # Client list
│       │   ├── NewClient.jsx    # Create client + invite link
│       │   ├── ClientDetail.jsx # Client info + job history
│       │   ├── NewJob.jsx       # Create job
│       │   └── JobDetail.jsx    # Job view + edit + media + comments
│       └── client/
│           ├── Dashboard.jsx    # Property + job list
│           └── JobDetail.jsx    # Job view + media + comments + calendar
```

---

## Notes

- **Nothing is ever deleted.** Media can be soft-hidden by admin (clients see a placeholder with the reason). Comments are append-only.
- **Signed URLs** for media expire after 1 hour. Each page load fetches fresh URLs.
- **Audit log** table records all admin actions for accountability.
- The app is fully mobile-friendly — clients can use it on their phones.

cloudflare: jwhmAE:HzE.Gb4F