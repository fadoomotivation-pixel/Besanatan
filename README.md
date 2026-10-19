# Be Sanatan — सेवा · श्रद्धा · संस्कार

आपके नाम से कन्या भोजन व हिन्दू दान-सेवा बुकिंग वेबसाइट (static HTML/CSS/JS)।
Static booking site for Kanya Bhojan & Hindu daan/seva performed in the devotee's name.

## फ़ाइलें / Files
- `index.html` — होम (hero, how it works, packages, sevas, trust, gallery, FAQ, contact)
- `booking.html` — बुकिंग फ़ॉर्म, UPI QR, स्क्रीनशॉट अपलोड, धन्यवाद + Booking Ref (BS-YYMMDD-XXXX)
- `config.js` — **सारी जानकारी व रेट यहीं बदलें / edit all info & rates here**
- `app.js`, `style.css`, `logo.svg`, `favicon.svg`, `assets/upi-qr.jpg` (असली QR / real QR), `assets/gallery/` (फ़ोटो यहाँ)

## मालिक को भरना है / Owner must fill (config.js)
| Key | क्या / What |
|---|---|
| `WEB3FORMS_KEY` | web3forms.com से मुफ़्त key (अपना ईमेल डालें) — बिना इसके बुकिंग आप तक नहीं पहुँचेगी / without it bookings are NOT delivered |
| `PHONE_DISPLAY` | संपर्क नंबर / contact phone |
| `EMAIL` | ईमेल |
| `ADDRESS` | पता |
| `SEVAS[].price` | अन्य सेवाओं के सुझाए रेट जाँचें / verify suggested seva rates |
| Gallery | `index.html` में PLACEHOLDER बॉक्स को असली फ़ोटो (`assets/gallery/`) से बदलें |

कोई testimonial, registration no. या आँकड़े नहीं डाले गए — केवल असली जानकारी जोड़ें। (No fake testimonials/stats.)

## बुकिंग कैसे पहुँचती है / How bookings arrive
फ़ॉर्म सबमिट होने पर (name, phone, gotra, seva, package, amount, date, message, booking ref + screenshot) Web3Forms को multipart POST होता है और आपके ईमेल पर आता है। प्रमाण ग्राहक के दिए नंबर/ईमेल पर भेजें।
Note: Web3Forms file attachments may need their paid plan; check web3forms.com. If key is empty, a dev-only notice shows on localhost and the thank-you page still appears.

## मुफ़्त डिप्लॉय / Free deploy
- **Netlify:** app.netlify.com/drop पर फ़ोल्डर/ZIP drag-drop करें।
- **Vercel:** vercel.com → New Project → यह GitHub repo import → Framework "Other" → Deploy.
- **GitHub Pages:** Repo → Settings → Pages → Branch `main` / root → Save.

Local test: `python3 -m http.server 8000` → http://localhost:8000
