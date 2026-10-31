# 🌌 Peak Fiction — Fictional Universes & Rankings Hub

A modern, interactive web application showcasing rankings, reviews, favorite characters, and consumption hours across all fictional universes — Anime, Manga, Manhwa, Novels, Books, Movies, TV Shows, and Comics — curated side-by-side by **Pratyush** and **Kanav**.

---

## 📊 Dataset Structure

The database is two CSV files in this repo:

- **`data/stories.csv`**: every story (one row each).
- **`data/top25.csv`**: the top-25 list shown on the Peak mountain, in rank order.

Edit them in Excel, Numbers, Google Sheets (import, then export as CSV) or any text editor, then commit and push; Vercel redeploys automatically. In Excel, save as **CSV UTF-8** so curly quotes and accents survive. Columns are matched by header name, so you can reorder them.

### CSV Columns Schema

| Column | Description | Sample Values |
| :--- | :--- | :--- |
| `Name` | Title of the story or universe | *Omniscient Reader's Viewpoint*, *Arcane*, *Mistborn* |
| `Medium` | Comma-separated media formats | `anime`, `Manga`, `Manhwa`, `Novel`, `Book`, `movie`, `show`, `comic` |
| `Genre` | Comma-separated genres | `Action`, `Dark Fantasy`, `Sci-Fi`, `Isekai`, `LitRPG`, `Romance` |
| `Length` | Optional volume / episode count | *271 manga chapters, 52 anime episodes, 1 movie* |
| `Hours it would take...` | **Estimated time to consume (hours)** | `500`, `353`, `28` |
| `Ranking - Pratyush` | Pratyush's tier ranking | `Peak`, `S`, `A`, `B`, `C`, `D`, `L`, `-` (optional `+`/`-` modifier, e.g. `C+`) |
| `Comments - Pratyush` | Pratyush's review & notes | *"Peak world-building..."* |
| `Ranking - Kanav` | Kanav's tier ranking | same as above |
| `Comments - Kanav` | Kanav's review & notes | *"Awesome action..."* |
| `Favorite Character(s)` | Favorite characters from the story | *Gojo Satoru, Levi, Sung Jin-Woo* |
| `Image_URL` | Link to poster image | *https://...* |

---

## 🏆 Ranking Tiers

The app groups and categorizes universes dynamically based on the highest rating awarded by either Pratyush or Kanav. The tiers are ordered as follows:

| Tier Badge | Meaning & Description |
| :--- | :--- |
| 🔥 **Peak** | *"I love this story, I will talk about it for hours and pitch it to you."* |
| ⚡ **S Tier** | *"Exceptional story."* Outstanding execution and storytelling. |
| ✨ **A Tier** | *"Really fun story, minor issues but they don't distract, not truly mindblowing."* |
| 👍 **B Tier** | *"Kinda enjoyed it, but obvious need for improvement at parts."* |
| 🟡 **C Tier** | Average or mixed feelings. |
| 🟠 **D Tier** | Below average. |
| 🔴 **L Tier** | Took an L. Do not recommend. (Replaces the old E and F tiers.) |

Modifiers (`C+`, `A-`, `Peak+`) are shown as written and nudge the numeric score by ±0.33; stories are grouped under the base tier. All tier logic lives in `src/lib/tiers.js`.
| ⏳ **Pending (`-`)** | Story is queued to be rated by Pratyush or Kanav. |

---

## 👥 Dual-User Features & Visual Views

- **🌐 Top Navigation Bar**: Floating glassmorphism header for switching between About, Peak, All Stories and Charts. Every page has its own URL (`#/peak`, `#/stories`, `#/charts`), and each story can be linked directly (`#/stories/jujutsu-kaisen`).
- **Side-by-Side Brother View**: Detailed modals display Pratyush and Kanav ratings, comments, and avatar badges side-by-side.
- **🏔️ Interactive Mountain Climbing View**:
  - Visual ranking mountain with a procedural 3D-effect mountain range and glowing night sky.
  - Smooth mathematical sine-wave trail winding from base to peak, with flag placement uniformly spaced along the arc length of the winding path.
  - Top recommendations placed proudly at the mountain peak.
  - Dynamic amplitude clamping ensuring flags remain strictly on the mountain slopes.
  - Detailed hover tooltips showing poster artwork, rank badges, consumption hours, genres, and individual reviews.
  - Minimap elevation tracker and fast scroll controls to navigate between peak and forest base.
- **Interactive Story Tiles (All Stories)**: Cards compactly display consumption hours and a message bubble count for comments. Clicking a card opens a detailed popup containing the poster image and comprehensive story information.
- **Smart Grouping & Elevator Navigation**: All Stories automatically groups stories by their highest tier. Colored glowing dividers separate tiers, and a pinned left-side elevator navigation allows you to effortlessly jump between rating sections.
- **Filters & Search**: Filter by tier, medium and genre, or search titles, characters and genres.
- **Message Me**: Every story popup has a form that emails Pratyush via [Web3Forms](https://web3forms.com). Without a key configured it shows an email link instead.
- **📊 Data Analysis & Charts View**:
  - **Scatter Plot (Length vs. Rating)**: Interactive plot mapping time commitment against tier rating score, with filters for Average, Pratyush, or Kanav ratings.
  - **Versus & Vibe Matrix (Bubble Chart)**: Plots Kanav's Rating vs. Pratyush's Rating with bubble radii proportional to consumption hours.
  - **Clickable & Interactive Nodes**: Hovering node shows story poster, metrics, and reviews; clicking opens the full Story Detail modal.
  - **Top 3 Leaderboards**: Dynamic rankings for top-rated genres and consolidated media formats.
  - **Side-by-Side Brother Analytics**: Split-screen comparative bar charts for Ratings Distribution, Consolidated Media Breakdown, and Top 5 Genres Consumed.
- **ℹ️ About Page**: The wooden-sign intro lives in `src/components/AboutView.jsx` (`About.md` is a plain-text copy of the same content).

---

## 🚀 Development & Workflow

### 1. Cache Posters (after adding stories)
Downloads any new `Image_URL` posters into `public/posters/` so the site doesn't depend on hotlinked images:
```bash
npm run posters
```
Use `npm run posters -- --force` to re-download every poster. Posters are resized with macOS `sips` when available. Commit the new files in `public/posters/`.

### 2. Start Dev Server
Launch the local interactive application:
```bash
npm run dev
```

### 3. Build Production Bundle
Build for deployment:
```bash
npm run build
```

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite
- **Data Visualizations**: Recharts
- **Messages**: Web3Forms (`VITE_WEB3FORMS_KEY` in `.env` and in Vercel → Settings → Environment Variables; see `.env.example`)
- **Icons**: Lucide React
- **Styling**: Custom Glowing Tier Dividers, Elevator Navigation, and Responsive Charts
- **Data Engine**: CSVs in `data/` → parser (`src/lib/storyCsv.js`) → normalisation (`src/lib/stories.js`, `src/lib/tiers.js`); poster cache script (`scripts/sync_posters.js`)
