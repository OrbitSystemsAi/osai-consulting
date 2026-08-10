# OSAI CRM production setup

The app runs locally without credentials in preview mode. Once Clerk is connected, `/admin` becomes an authenticated route in the UI. All CRM data endpoints must also verify the Clerk session and the user's `admin` role before returning private data.

## 1. Create the GitHub repository

1. Sign in at https://github.com and choose **New repository**.
2. Name it `osai-consulting-crm`, keep it **Private**, and do not add a README or `.gitignore (this project already has them).
3. From this project directory, run:

   ```bash
   git init
   git add .
   git commit -m "Build OSAI CRM landing and admin foundation"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/osai-consulting-crm.git
   git push -u origin main
   ```

Never commit `.env.local`, Clerk secret keys, or the Neon connection string.

## 2. Create the Vercel project

1. Sign in at https://vercel.com using GitHub.
2. Choose **Add New → Project**, import `osai-consulting-crm`, and leave the detected framework as **Next.js**.
3. Keep the default Next.js build settings, then deploy.
4. Every later push to `main` deploys production; feature branches receive preview deployments.

## 3. Add Clerk authentication

Recommended path: open the Vercel project, choose **Storage/Marketplace**, find **Clerk**, and connect it to this project. You can also create the application directly at https://dashboard.clerk.com.

1. Name the Clerk application `OSAI Consulting CRM`.
2. Enable Email plus whichever social providers you want (Google and GitHub are sensible defaults).
3. In Clerk, restrict sign-up or use invitations so this remains an admin workspace.
4. Add these Vercel environment variables for Development, Preview, and Production:

   ```text
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   REQUIRE_ADMIN_ROLE=true
   ```

5. Add `http://localhost:3005` and the Vercel production domain to Clerk's allowed origins/redirects.
6. Pull only the publishable key into `.env.local` for local UI testing. Keep the secret key server-only.
7. In Clerk Organizations, create an OSAI organization and assign administrators the `org:admin` role. Before real client data is added, enforce that role in every serverless API handler—not only in the browser UI.

## 4. Add Neon Postgres

1. In the Vercel project, choose **Storage → Create Database → Neon Postgres**.
2. Create a database in the region closest to the majority of users and connect it to all three environments.
3. Vercel automatically provisions `DATABASE_URL`; verify it under **Project Settings → Environment Variables**.
4. In the Neon SQL Editor, run [`database/schema.sql`](database/schema.sql).
5. Redeploy, then visit `/api/health`. A successful connection returns:

   ```json
   { "status": "ok", "database": "connected" }
   ```

The database URL is used only by Next.js server routes. Never prefix it with `NEXT_PUBLIC_` or reference it from browser code.

## 5. Local environment

Copy `.env.example` to `.env.local`, replace only the values you have, and run:

```bash
npm install
npm run dev -- --port 3005
```

The public landing page is `/`; the admin workspace is `/admin`.

## Production security gate

Before storing real customer information:

- Verify Clerk JWTs in every `/api/*` CRM endpoint.
- Require the Clerk `org:admin` role for admin mutations.
- Keep `DATABASE_URL` and `CLERK_SECRET_KEY` server-only.
- Use parameterized Neon queries and validate request bodies.
- Turn on MFA for administrators and GitHub/Vercel owners.
- Test authentication and role denial in a Vercel preview deployment.
