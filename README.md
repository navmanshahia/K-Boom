# K-Boom Kleen — The art of arriving home

A complete replacement of the previous application. React / Vite website, interactive Three.js room, Node API and Netlify Blobs persistence. Previous source remains recoverable in Git history.

## Deploy to Netlify (full stack)

Connect this repository, branch `main`. The included `netlify.toml` sets `npm run build`, `dist`, functions and API routes. Node 22 or newer is required. Netlify provisions Blobs storage automatically.

Set environment variables in Netlify **before using the owner dashboard**:

- `KBOOM_ADMIN_PASSWORD`: a long unique private password (required).
- `KBOOM_SESSION_SECRET`: a separate random secret, recommended (at least 32 characters). Changing it invalidates existing sessions. If omitted the admin password signs sessions.

Redeploy after adding variables. Open `/admin` to sign in. No default password exists. The existing environment variable name is preserved for compatibility, but this new application uses a separate `kboom-v3-production` store; it does not migrate or delete historical enquiry data.

The public site can display on static hosting, but enquiry persistence and admin require the backend. GitHub Pages or copying `dist` alone to cPanel does NOT provide the API. Netlify is the supported production deployment. Do not serve unbuilt JSX.

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
