# Cosco — Supabase backend

This folder holds everything that lives on Supabase: the database schema
and the email-notification Edge Function.

Project ref: `trubcyitreqrvkqmumen` · Region: `ap-south-1`

## 1. Create the tables + security

Open the Supabase dashboard → **SQL Editor** → paste the contents of
`migrations/0001_init.sql` → **Run**.

This creates two tables (`enquiries`, `lucky_draw_entries`) and Row Level
Security so the public website can only *insert* rows, while only
logged-in admins can *read/update* them.

## 2. Lock down sign-ups (important)

Dashboard → **Authentication → Providers / Settings** → turn **OFF** public
sign-ups (email "Allow new users to sign up"). Then create your admin
login manually: **Authentication → Users → Add user** (email + password).
That account is what you log into the admin webapp with.

## 3. Emails (Gmail SMTP)

The `notify-submission` function sends from **coscooverseesedu@gmail.com**:
- a **lucky-draw entry** → emails the STUDENT their lot number + notifies the team
- an **enquiry** → notifies the team

**a) Get a Gmail App Password** for `coscooverseasedu@gmail.com`:
1. Turn on 2-Step Verification: https://myaccount.google.com/security
2. Create an App Password: https://myaccount.google.com/apppasswords
   (pick "Mail" → any device) → copy the 16-character password.

**b) Deploy + set secrets** (needs the Supabase CLI — `npx supabase`; a
Personal Access Token can replace interactive login):

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...          # personal access token
npx supabase functions deploy notify-submission \
  --project-ref trubcyitreqrvkqmumen --no-verify-jwt
npx supabase secrets set --project-ref trubcyitreqrvkqmumen \
  GMAIL_USER=coscooverseasedu@gmail.com \
  GMAIL_APP_PASSWORD="the 16-char app password" \
  NOTIFY_TO=lucintelsolutions@gmail.com \
  RESULTS_LABEL="July 10"
```

**c) Wire the triggers:** Dashboard → **Database → Webhooks → Create** a
webhook for table `lucky_draw_entries`, event **Insert**, type **Supabase
Edge Function**, function **notify-submission**. Repeat for `enquiries`.

Submissions still appear in the admin webapp regardless of email status.

## Tables

**enquiries** — contact form: `name, email, phone, destination, message,
source, status (new|contacted|closed), notes`.

**lucky_draw_entries** — raffle: `lot_number, name, age, phone, email,
country, course, prize, is_winner`.
