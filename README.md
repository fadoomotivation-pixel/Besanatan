# Be Sanatan — सेवा · श्रद्धा · संस्कार

आपके नाम से कन्या भोजन व हिन्दू दान-सेवा बुकिंग वेबसाइट (static HTML/CSS/JS)।
Static booking site for Kanya Bhojan & Hindu daan/seva performed in the devotee's name.

## फ़ाइलें / Files
- `kanya-pujan.html` — **Meta ads landing page** (one page: package → details → QR pay → screenshot upload). Ad URL: `https://www.besanatan.com/kanya-pujan.html`
- No public contact info is shown anywhere on the site (by owner's choice).
- `index.html` — होम (hero, how it works, packages, sevas, trust, gallery, FAQ)
- `booking.html` — बुकिंग फ़ॉर्म, UPI QR, स्क्रीनशॉट अपलोड, धन्यवाद + Booking Ref (BS-YYMMDD-XXXX)
- `config.js` — **सारी जानकारी व रेट यहीं बदलें / edit all info & rates here**
- `app.js`, `style.css`, `logo.svg`, `favicon.svg`, `assets/upi-qr.jpg` (असली QR / real QR), `assets/img/` (images)

## मालिक को भरना है / Owner must fill (config.js)
| Key | क्या / What |
|---|---|
| `SEVAS[].price` | अन्य सेवाओं के सुझाए रेट जाँचें / verify suggested seva rates |
| Gallery | असली सेवा की अपनी फ़ोटो (बिना बच्चों के चेहरे) `assets/img/` में डालें / add your own real seva photos |

कोई testimonial, registration no. या आँकड़े नहीं डाले गए — केवल असली जानकारी जोड़ें। (No fake testimonials/stats.)

## बुकिंग कैसे पहुँचती है / How bookings arrive
बुकिंग व भुगतान स्क्रीनशॉट Supabase (SalesAutoCall project, isolated `bs_*` tables) में सहेजे जाते हैं।
- Table `public.bs_bookings`, private bucket `bs-payment-screenshots`, admin list `public.bs_admins`
- `config.js` में `SUPABASE_URL` + `SUPABASE_KEY` (publishable key — public by design; RLS lets visitors only INSERT)
- Admin panel: **`/admin.html`** (not linked publicly, noindex). Login / sign up / forgot password → bookings list, filters, totals, screenshot (signed URL), status + note, CSV export.
- नया एडमिन जोड़ने के लिए / Add another admin (Supabase SQL editor): `insert into public.bs_admins(email) values ('name@example.com');` (lowercase)
- Schema: `supabase/migrations/`

### पहली बार एडमिन सेटअप / First-time admin setup
1. Supabase dashboard → Authentication → URL Configuration → **Redirect URLs** में जोड़ें (Site URL मत बदलें, वह SalesAutoCall का है): `https://www.besanatan.com/admin.html`, `https://besanatan.vercel.app/admin.html`
2. https://www.besanatan.com/admin.html → "पहली बार? / Sign up" → Musicofmajor@gmail.com + password
3. ईमेल में confirm link दबाएँ → फिर Login करें।

## मुफ़्त डिप्लॉय / Free deploy
- **Netlify:** app.netlify.com/drop पर फ़ोल्डर/ZIP drag-drop करें।
- **Vercel:** vercel.com → New Project → यह GitHub repo import → Framework "Other" → Deploy.
- **GitHub Pages:** Repo → Settings → Pages → Branch `main` / root → Save.

Local test: `python3 -m http.server 8000` → http://localhost:8000
