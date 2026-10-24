Client Website Planner

index.html     the planner page (open this in a browser)
style.css      the design
script.js      all the logic (colour wheel, palettes, preview, summary, sheet sync)
               SCRIPT_URL at the top = your Google Apps Script Web app URL
sitegen.js     builds the Full site preview
safety.js     checks everything pasted, loaded or restored before it is used
apps-script.gs NOT part of the website. Paste it into Google Apps Script.
               SHEET_ID at the top = your Google Sheet ID
notes.txt      your original notes and the AI prompt

LAYOUTS: 22 layouts in step 3. Newest 8 (2026 trends): SaaS showcase, Floating pill nav, Neo-brutalist,
         Numbered steps, Portfolio grid, Sticky split, Announcement bar, Card carousel.
         They change the Live preview and the AI prompt. The zip download still uses the one shared site design.

Keep index.html, style.css, script.js, safety.js and sitegen.js in the same folder.
In VS Code: File > Open Folder, pick this folder, then right-click index.html > Open with Live Server (or just double-click index.html).

ACCOUNTS AND ONLINE SAVING (optional)
config.js + cloud.js    sign in, save websites online, autosave, version history (see supabase/SETUP.md).
                        Leave config.js empty to keep working exactly as before.
supabase/               database tables and security rules (migrations) and the test for those rules.
tests/                  developer tests (see tests/README.md). Not needed to use the builder.


CONTACT DETAILS -> GOOGLE SHEET: read CONTACT-DETAILS-TO-GOOGLE-SHEET.txt (planner + client website form).
contact-form-apps-script.gs = Apps Script for the client website's contact form.
The Google Sheet web app URL now lives only in SCRIPT_URL at the top of script.js.