## Cinematic edition

The homepage now opens with a full-screen Three.js architectural film: procedural alpine scenery, rippling water, warm lights, drifting particles and a scroll-controlled camera moving towards the interior. Three editorial chapters follow the camera journey. Motion can be paused; reduced-motion users get a static opening without the extended scroll sequence. A photographic fallback remains visible if WebGL is unavailable. This is an illustrative brand environment, not a claim about a property serviced by K-Boom.

The release is already built in `deploy/`. In the current cPanel checkout, open `https://elite-noir.com/K-BoomKleen/deploy/` after updating from remote. No npm is needed on the host. Keep existing server-side `config.php` and `.private/` data.

# cPanel deployment — primary deployment method

The `deploy/` folder contains the complete prebuilt website and PHP backend. No npm or Node is needed on your cPanel host. Requires PHP 8.1+ and Apache/LiteSpeed with `.htaccess` rewriting enabled. Use HTTPS.

## Deploy HEAD Commit

1. In cPanel Git Version Control, update this repository from `main`.
2. In the Git checkout folder, create `deploy-path.txt` with one line containing the exact absolute destination, for example `/home/YOUR_USERNAME/public_html/kboom`. For a dedicated domain use its document root inside public_html. Do not use a folder belonging to another website.
3. Click **Deploy HEAD Commit**. The included `.cpanel.yml` copies `deploy/` to that destination. No build commands run on the server.
4. In the deployed destination, copy `config.example.php` to `config.php`, replacing the setup key with a unique random private value of at least 24 characters.
5. Visit `https://YOUR_DOMAIN/YOUR_FOLDER/setup.php`, enter that installation key and choose an owner password of at least 14 characters. Setup locks after success.
6. Open `/admin` within that same website folder. Submit a test enquiry and confirm it appears in the dashboard.

Alternatively upload the complete contents of `deploy/`, **including `.htaccess`**, directly to the domain document root. Root and subfolder installations are supported. Keep `.private/` and `config.php` on the server; do not commit them or remove them on updates. Back up `.private/` to preserve enquiries and credentials. Its `.htaccess` denies web access; verify requests to that folder are forbidden after deployment.

No email notifications or payments are configured. The owner checks the dashboard for enquiries. Existing Netlify records are not automatically migrated.

To rebuild release files after source edits: `npm ci && npm run build:cpanel`, then commit `deploy/` as well as source changes.

---

# K-Boom Kleen — The art of arriving home

A complete replacement of the previous application. React / Vite website, interactive Three.js room, Node API and Netlify Blobs persistence. Previous source remains recoverable in Git history.

## Optional Netlify deployment

Connect this repository, branch `main`. The included `netlify.toml` sets `npm run build`, `dist`, functions and API routes. Node 22 or newer is required. Netlify provisions Blobs storage automatically.

Set environment variables in Netlify **before using the owner dashboard**:

- `KBOOM_ADMIN_PASSWORD`: a long unique private password (required).
- `KBOOM_SESSION_SECRET`: a separate random secret, recommended (at least 32 characters). Changing it invalidates existing sessions. If omitted the admin password signs sessions.

Redeploy after adding variables. Open `/admin` to sign in. No default password exists. The existing environment variable name is preserved for compatibility, but this new application uses a separate `kboom-v3-production` store; it does not migrate or delete historical enquiry data.

The public site can display on static hosting, but enquiry persistence and admin require the backend. GitHub Pages or copying `dist` alone to cPanel does NOT provide the API. Use the PHP-enabled `deploy/` folder for cPanel. Do not serve unbuilt JSX.

## Local run

```sh
npm ci
KBOOM_ADMIN_PASSWORD='choose-a-local-password' npm run dev
```

Open http://localhost:5173. Local data lives in ignored `.data/`. This is isolated from Netlify. `npm run build` builds production assets; `npm start` serves the build with the local API. Put TLS and a production process manager in front if adapting this server to another host.

## Features

- Responsive editorial design, scroll reveals, reduced-motion support.
- Lazy-loaded real Three.js architectural bedroom with pointer perspective.
- Actual-work gallery and separate atmosphere photography, explicitly identified.
- Two-step consultation enquiry with validation, consent and real durable storage.
- Owner session in HttpOnly / Secure / SameSite cookie; 8-hour expiry.
- Login throttling, same-origin mutation checks, request limits and honeypot.
- Enquiry search, status filters, private notes and status workflow.
- Edit headline, introductory text, phone and email from admin.
- Privacy page, mobile menu, FAQ, working phone/email contact links.

## Operations and limitations

Enquiries are requests, not confirmed bookings. There is no payment collection or live availability calendar. Email notifications are not configured: the owner must check the dashboard. No outgoing messages are sent automatically. Configure an email service in a subsequent integration if required.

No fabricated reviews, ratings or business promises were added. The illustrative 3D room and atmosphere photographs do not represent completed K-Boom projects. Actual results are from the existing K-Boom website. Obtain/retain property-owner permission for public display. Founder background and contact details were carried over from the existing public website and should be confirmed by the owner.

## Images

Atmosphere imagery from Unsplash: photo-1600210492486-724fe5c67fb0, photo-1611892440504-42a792e24d32, photo-1600607687920-4e2a09cf159d. Actual results: original K-Boom `assets/gallery/work.jpg` and `main.jpg`. Images are stored locally so the gallery does not depend on the old deployment.

## Verification

`npm test` tests persistence, admin authorization, session tampering, cross-origin rejection and missing deployment credentials. `npm run build` checks the production bundle. Browser smoke test: `node tests/browser.mjs` against local server (Playwright Chromium required).
