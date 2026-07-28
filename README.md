# Aftertaste — Tableside Guest Feedback

*The impression a great meal leaves behind.*

A premium, mobile-first feedback and review app for restaurants. Guests scan a
QR code at their table, rate their visit, and are smartly routed: happy guests
are invited to leave a Google review (with a reward), while unhappy guests are
guided to a private form so the owners can make it right.

This is a complete, ready-to-run project. You don't need to be a developer to
get it going — just follow the steps below.

---

## What you need first (one time)

Install **Node.js** (this is the free tool that runs the app). Download the
"LTS" version from https://nodejs.org and install it like any normal program.
That's the only thing you need.

---

## How to run it on your computer

1. Unzip this folder somewhere easy to find (e.g. your Desktop).
2. Open a terminal **in this folder**:
   - **Mac:** right-click the folder → *New Terminal at Folder*.
   - **Windows:** open the folder, type `cmd` in the address bar, press Enter.
3. Type this and press Enter (only needed the first time):

   ```
   npm install
   ```

4. Then type this and press Enter:

   ```
   npm run dev
   ```

5. It will show a link like `http://localhost:5173`. Open that in your browser.
   Resize the window narrow, or open it on your phone, to see the mobile view.

To stop it, go back to the terminal and press `Ctrl + C`.

---

## Making it yours (no coding needed)

Open the file `src/Aftertaste.jsx` in any text editor. At the very
top you'll find a block called **`CONFIG`** — this is the only part you need to
touch:

```js
const CONFIG = {
  restaurantName: "Aftertaste",   // your restaurant's name
  tagline: "Guest Feedback",               // small line above the name
  defaultTable: "Table 4",            // table shown first
  tables: ["Table 1", "Table 2", ...],// your tables / sections
  servers: ["Ava M.", "Marco R.", ...],// your staff
  googleReviewUrl: "https://...",     // your Google review link
  reward: "free coffee or dessert",   // the perk for leaving a review
};
```

Change the text between the quotes, save the file, and the app updates
automatically.

**Your Google review link:** in your Google Business profile, look for "Ask for
reviews" / "Get more reviews" — it gives you a short link. Paste it into
`googleReviewUrl`.

---

## Sharing it with someone else

- **Just send the code:** zip this folder and send it. They follow the same
  steps above.
- **Work on it together:** put this folder in a free GitHub repository and add
  them as a collaborator (repo → Settings → Collaborators). You can then both
  edit with full history.
- **Try it online with no install:** upload this folder to https://stackblitz.com
  or https://codesandbox.io (both are free) to get a live link you can share.

---

## Putting it online for real (when ready)

Run `npm run build`. This creates a `dist` folder — a finished website. Drag
that `dist` folder onto https://app.netlify.com/drop (free) and you'll instantly
get a public web address. Point your table QR codes at that address and you're
live.

---

## What's in this folder

- `src/Aftertaste.jsx` — the app itself (edit `CONFIG` at the top).
- `src/main.jsx`, `src/index.css` — startup files (you can ignore these).
- `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`,
  `package.json` — project setup (you can ignore these).

Built with React, Vite, Tailwind CSS, and lucide-react icons.
