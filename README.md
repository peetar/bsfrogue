# BSF Romans Study PWA (2026–2027)

A fast, accessible, offline-first Progressive Web App (PWA) designed for doing Bible Study Fellowship (BSF) Romans lessons on mobile phones, tablets, and desktop computers.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite PWA**. Ready for zero-config deployment to **Vercel**.

---

## 🌟 Key Features

### 1. Mom-Friendly Zoom & Readability Controls
- **Persistent Header Font Stepper**: Instant `A-` and `A+` buttons right in the navigation bar to dynamically scale text size from Normal (16px) up to Jumbo (28px).
- **5 Granular Font Size Presets**: Normal (100%), Medium (112%), Large (125%), Extra Large (150%), Jumbo (175%).
- **Theme Options**:
  - **Light Mode**: Crisp, high-contrast display.
  - **Warm Paper / Sepia Mode**: Gentle, soothing parchment color scheme specifically designed to eliminate harsh glare for elderly eyes.
  - **Dark Mode**: Low-light night reading.
- **Font Choice**: Switch between modern system sans-serif and classic book serif (Georgia/Roman).
- **Auto-Growing Answer Boxes**: Answer boxes expand automatically as you type so you never have to scroll inside a cramped 3-line box.

### 2. Mobile & Desktop Responsive Layout
- **Mobile First**: Thumb-friendly navigation with sticky header, horizontally scrollable Day tabs (`Day 1` through `Day 6`), and generous touch targets.
- **Desktop Friendly**: Focused reading width that prevents line-stretching eye fatigue, complete with keyboard shortcuts.

### 3. Save-As-You-Go (Local Storage)
- **Zero Save Buttons**: Your answers are saved immediately as you type.
- **Visual Feedback**: Subtle "Saved ✓" checkmark indicator in the header.
- **100% Offline Capability**: Everything is cached on your device via Service Worker; study on an airplane or in a church basement with no Wi-Fi.
- **Backup & Restore**: Export your answers anytime as `.txt` (for sharing or printing) or `.json` (full backup to restore on another phone).

### 4. Smart Bible Scripture Links & In-App Pop-up Reader
- **In-App "Pop-up" Reader (Default)**: Draggable on desktop, clean bottom sheet on mobile. Auto-scrolls to and highlights target verses, with full chapter scrolling. Powered by the free static public-domain `wldeh/bible-api` CDN (BSB, WEB, KJV, ASV, FBV) with zero rate limits.
- **External Providers**: One-click toggle in Settings or inline dropdown to use **Blue Letter Bible** (`blueletterbible.org`) or **Bible Gateway** (`biblegateway.com`).
- **Translations Supported**: NIV (BSF default), ESV, NKJV, NLT, CSB, NASB, KJV.
- **Compound Scripture Parsing**: Correctly splits compound citations (e.g. `Romans 3: 1-12, 17-19` into two independent links; `Romans 2:17, 23, 25` into three links).
- Opens in external tabs on desktop, or your phone's browser in PWA mode.

### 5. Home Dashboard & Progress Tracking
- **"Resume Study" Hero Card**: One tap returns you directly to your last lesson and day worked on.
- **30-Lesson Grid**: Shows titles, passages, and progress bars for all 30 lessons, with direct jump pills to any of the 6 days.

### 6. Daily Study Reminders
- Choose which days to study (e.g., M, T, W, Th) and your preferred study time (e.g. 08:00 AM).
- **Browser Notifications**: Web Notification API support in PWA mode.
- **1-Click "Add to Phone Calendar" (.ics)**: Downloads a recurring calendar reminder with an alarm for Apple Calendar or Google Calendar on your phone.

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v20)
- npm 10+

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Start Production Preview Server
```bash
npm run build
npm run preview -- --port 4173
```
Open [http://localhost:4173](http://localhost:4173) in your browser.

---

## 📱 How to Install on Phone as a PWA

### iPhone / iPad (Safari)
1. Open the app URL in **Safari**.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. The BSF icon will appear on your home screen and open full-screen like a native app.

### Android (Chrome)
1. Open the app URL in **Chrome**.
2. Tap the **"Install App"** banner at the top, or tap the three dots menu `⋮` and select **"Install app"** (or "Add to Home screen").

---

## ☁️ Deploying to Vercel

When you are ready to deploy to Vercel:

### Option A: Via GitHub (Recommended)
1. Commit and push this repo to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete BSF Romans Study PWA"
   git push -u origin master
   ```
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `peetar/bsfrogue` repository.
4. Framework Preset: **Vite** (auto-detected).
5. Click **"Deploy"**.

### Option B: Via Vercel CLI
```bash
vercel
```
Follow the interactive prompts to link and deploy.
