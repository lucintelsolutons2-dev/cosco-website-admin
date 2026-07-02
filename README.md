# Cosco Website — Admin

Private dashboard for the Cosco Overseas Education website. Shows every
**enquiry** and **lucky-draw** submission from coscoedu.com, lets staff
update statuses / mark winners, and exports CSVs.

- **Stack:** React 19 + Vite + Tailwind + Supabase (auth + Postgres)
- **Data:** read live from Supabase (see `supabase/` for schema + email fn)
- **Auth:** Supabase email/password. Only manually-created admin users can log in.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the two values
npm run dev                  # http://localhost:5174
```

`.env.local` needs (from Supabase dashboard → Settings → API):

```
VITE_SUPABASE_URL=https://trubcyitreqrvkqmumen.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable / anon key>
```

## First-time backend setup

See [`supabase/README.md`](./supabase/README.md) — run the SQL migration,
disable public sign-ups, create an admin user, and deploy the email function.

## Build & deploy (Docker, same pattern as the main site)

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://trubcyitreqrvkqmumen.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=<anon key> \
  -t cosco-admin .
docker run -d --restart unless-stopped -p 127.0.0.1:3002:80 cosco-admin
```

Then point a subdomain (e.g. `admin.coscoedu.com`) at it via Caddy/Nginx,
just like `stage.coscoedu.com`.

> The anon key is safe to ship to the browser — Row Level Security means
> visitors can't read data; only authenticated admins can.
