# K•BOOM Kleen

### Premium property care for Wānaka & surrounds

A polished, motion-led website and quote-management platform for **K-Boom Kleen** — designed around a simple promise: make every property feel immaculate, effortless and guest-ready.

> **Immaculate spaces. Effortlessly ready.**

---

## ✦ The Experience

K-Boom is more than a brochure website. It combines a luxury customer experience with a practical operating system for the business owner.

### Customer website
- Premium responsive design for desktop, tablet and mobile
- Framer Motion interactions, reveals and transitions
- Short-stay turnover, deep-clean and linen-service presentation
- Interactive instant quote estimator
- Private pricing logic — internal hourly pricing is never displayed publicly
- GST-inclusive customer estimate
- Two-step quote-request flow
- Service-area presentation for Wānaka, Albert Town, Lake Hāwea and Luggate

### Owner portal
- Secure owner login
- Live quote-request dashboard
- Customer contact, area, requested date and property notes
- Estimate values and request history
- Quote pipeline statuses: New → Contacted → Booked / Declined
- Dashboard metrics
- Dynamic website-copy controls
- Private estimator/pricing controls
- Persistent configuration and quote storage with Netlify Blobs

---

## ✦ Technology

| Layer | Technology |
| --- | --- |
| Frontend | React |
| Build | Vite |
| Motion | Framer Motion |
| Icons | Lucide React |
| Hosting | Netlify |
| Serverless API | Netlify Functions |
| Persistence | Netlify Blobs |
| Source control | GitHub |

---

## ✦ Project Structure

```text
K-Boom/
├── index.html
├── admin.html
├── package.json
├── netlify.toml
├── src/
│   ├── premium.jsx
│   └── premium.css
└── netlify/
    └── functions/
        ├── config.js
        └── quotes.js
```

The repository may also contain earlier design/source files retained during development. The production entry point is configured through `index.html`.

---

## ✦ Local Development

Requirements: a current Node.js/npm installation.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

Vite outputs the production website to `dist/`.

---

## ✦ Netlify Deployment

The included `netlify.toml` configures:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Netlify Functions are located in `netlify/functions/`.

### Required environment variable

Set this in the Netlify site's environment variables:

```text
KBOOM_ADMIN_PASSWORD
```

Use a strong private value. **Never commit the actual password to this repository.**

The owner portal is available at:

```text
/admin.html
```

---

## ✦ Quote Estimator

The estimator converts the selected property scope into an internal time/cost calculation and presents the customer with a simple GST-inclusive estimated total.

Internal pricing variables are intentionally managed separately from the public-facing presentation. Customers do **not** see an hourly-rate breakdown.

The owner portal provides controls for estimator values so pricing can evolve without redesigning the customer experience.

> Estimates are indicative until K-Boom confirms the final scope and booking.

---

## ✦ Dynamic Content

The website retrieves its configurable content from the Netlify configuration function. This allows selected website text and estimator settings to be maintained through the owner portal rather than hard-coded for every update.

Quote submissions are handled by the quote function and stored for the owner dashboard.

---

## ✦ Security Notes

- Keep `KBOOM_ADMIN_PASSWORD` only in Netlify environment variables.
- Do not commit credentials, API keys or customer exports.
- Admin API operations require the configured owner password.
- Public customers can submit quote requests but cannot access the owner quote list.
- Internal estimator pricing should remain private.

---

## ✦ Brand Direction

The digital identity is built around **quiet luxury**: warm ivory, deep botanical tones, restrained gold accents, editorial typography, generous negative space and purposeful motion.

The goal is not to make cleaning look transactional. It is to make K-Boom feel like **premium property care**.

---

## ✦ Service Area

**Wānaka · Albert Town · Lake Hāwea · Luggate**

---

## Status

**Active development / production deployment**

Current focus:
- Premium customer experience
- Reliable quote-estimator workflow
- Owner-controlled content and pricing
- Quote lead management
- Production stability on Netlify

---

© K-Boom Kleen. All rights reserved.
