# Setting up accounts and online saving (Supabase)

You only do this once. Until you do, the builder works exactly as before (local drafts, Google Sheet, ZIP export).
No credit card is needed: Supabase's free plan is enough to try all of this.

## 1. Create the project
1. Go to https://supabase.com, sign up, and click **New project**. Pick a name, a strong database password (save it
   in a password manager, you will rarely need it) and the region closest to your customers.
2. Wait about two minutes until the project is ready.

## 2. Create the tables and the security rules
1. In the left menu open **SQL Editor** > **New query**.
2. Open `supabase/migrations/0001_projects.sql` from this folder, copy everything, paste it, click **Run**.
   It should end with "Success. No rows returned".

## 3. Check the security rules work (important, 2 minutes)
1. New query. Paste all of `supabase/tests/rls_test.sql` and click **Run**.
2. The last result must say **ALL ... CHECKS PASSED** and every row in the table must show `passed = true`.
3. The test deletes its own data afterwards. If anything says `false`, do not launch, and send me the row.

## 4. Sign-up settings
Dashboard > **Authentication**:
- **Providers > Email**: keep "Confirm email" switched ON (people must prove they own the address).
- **Policies / Password**: set the minimum password length to **8** (the builder also enforces it).
- **URL Configuration**: set **Site URL** to the https address where you host the builder, and add the same address
  under **Redirect URLs** (password-reset and confirmation links return there).
- Supabase's built-in email sender is only meant for testing and is limited to a few emails per hour. Before real
  customers use sign-up, add your own email service under **Authentication > SMTP Settings**.

## 5. Connect the builder
1. Dashboard > **Project Settings > API**.
2. Copy **Project URL** and the **anon / publishable** key into `config.js`.
3. NEVER copy the `service_role` / `secret` key. The builder refuses to start if it finds one.
4. Upload the whole folder to a host that serves it over **https** (for example Netlify, Cloudflare Pages, GitHub
   Pages or Vercel static hosting; all have free plans). Accounts will not work from a file opened on your computer,
   because the sign-in and reset links need a real web address.

## 6. Try it (smoke test)
1. Open the site, click **Sign in**, create an account, click the link in the email, sign in.
2. Fill in a business name, add a photo, click **Save it to my account**. The status should say **Saved**.
3. Refresh the page: everything should still be there.
4. Open the site on another device or browser, sign in, click **Open**: the text and photo should appear.
5. Create a second account; it must see none of the first account's websites.

## Costs and limits to know about
- Free plan: 500 MB database, 1 GB file storage, and projects **pause after a week without activity** (you can resume
  them with one click). The Pro plan (about 25 USD per month at the time of writing; check the current price) removes
  the pause and adds daily backups. You do not need it to start.
- Each account can hold 200 websites; each photo is limited to 10 MB; each website's saved data to 2 MB.
- Photos can be PNG, JPEG, WebP, GIF or AVIF. SVG pictures are not stored online (they stay on the device).

## Backups and recovery
- **Mistakes inside the app:** every account keeps its last 50 versions of each website (Version history), and
  "Delete" only moves a website to "Show deleted".
- **Whole-database backup:** the free plan has no automatic backup. Download one regularly from
  Dashboard > Database > Backups (if shown) or run `pg_dump` with the connection string from Project Settings >
  Database. The Pro plan adds daily backups.
- **Photos:** Storage files are not part of a database dump. Download them from Dashboard > Storage if you need a copy.

## Not included yet (honest list)
- Deleting an account and all its data from inside the app (needs a server-side function; planned).
- Team sharing, roles, and publishing a website to the internet (later phases).
- Server-side rate limiting beyond what Supabase Auth already applies to sign-in and sign-up.
