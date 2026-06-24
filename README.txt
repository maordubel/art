DUBEL ART — catalogue website  (Dubel Team, Art Department)
===========================================================
Upload the ENTIRE contents of this folder to your web host (art.dubel.team),
keeping the structure intact — especially the /images folder next to the HTML files.

PAGES
  index.html      Gallery homepage
  artwork.html    Single-artwork page (?id=<slug>)
  contact.html    Enquiry form (?work=<slug> pre-selects a work)
  admin.html      Admin panel — manage works, prices, images, settings
  data.js         All content (single source of truth)
  app.js          Shared logic
  styles.css      Styles
  images/         Web-optimized artwork images (full + -thumb)

ADMIN
  URL:      art.dubel.team/admin.html
  Passcode: dubel-art-2026   (change it in Site Settings)
  Publish:  edit -> Save (local preview) -> Export data.js -> re-upload data.js to the server.

CONTACT FORM  (IMPORTANT — one-time setup so enquiries reach your inbox)
  The form delivers to your email WITHOUT showing your address to visitors.
  1) Go to https://web3forms.com  ->  enter your inbox address  ->  copy the Access Key.
  2) In admin -> Site Settings -> "Contact form access key" -> paste the key -> Save -> Export data.js -> re-upload.
  Until a key is added, the form will show a polite "not connected yet" notice.

PRICING
  All prices are shown in EUR as the "Asking price".
