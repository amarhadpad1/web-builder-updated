/* config.js - connection settings for accounts and online saving (Supabase).

   Leave both values empty to keep using the builder without accounts: everything else still works.

   WHERE TO FIND THEM: Supabase dashboard > your project > Project Settings > API
     supabaseUrl      the "Project URL"            e.g. https://abcdxyz.supabase.co
     supabaseAnonKey  the "anon" / "publishable" key

   These two values are meant to be public. Your data is protected by the database rules in
   supabase/migrations, not by hiding this key.

   NEVER paste the "service_role" or "secret" key here. Anyone who opens the website could copy it and read
   or delete every customer's data. The builder refuses to start if it recognises such a key. */
window.WB_CONFIG = window.WB_CONFIG || {
  supabaseUrl: '',
  supabaseAnonKey: ''
};
