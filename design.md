# Peak Fiction: Core Design System & Aesthetic Guidelines

## 1. Core Philosophy & Personality
This application should **not** look like a generic, sterile corporate dashboard or standard "AI-generated slop." Instead, it embodies a playful, expressive, and slightly whimsical personality that doesn't take itself too seriously. 

- **Vibe:** Fun, bold, expressive, and deeply passionate about the media being discussed.
- **Visual Tone:** Cartoon-y silhouettes, vibrant glowing neon accents, bouncy micro-animations, and glassmorphism. It should feel like a colorful arcade or an interactive graphic novel rather than a standard spreadsheet app.
- **Expressiveness:** The use of emojis, playful shapes (like flags, mountains, squiggly lines), and dynamic gradients breaks the rigidity of standard UI grids.

## 2. Color Profile & Palette
The application uses a rich dark theme contrasted against highly saturated, glowing accent colors.

### Base Colors
- **Background (Dark):** `#090a0f`
- **Card Background (Glassmorphism):** `rgba(18, 21, 31, 0.7)` (with hover state brightening to `0.85` opacity).
- **Text (Main):** `#f8fafc` (Off-white for readability)
- **Text (Muted):** `#94a3b8`

### Accent Colors (The "Glow")
- **Purple:** `#a855f7`
- **Cyan:** `#06b6d4`
- **Pink:** `#ec4899`
- **Gold:** `#f59e0b`

*Note on Gradients:* The primary aesthetic heavily features gradients across text (`gradient-text`), lines, and borders. For example, text might transition seamlessly from purple to cyan to pink.

### Tier Rating Colors (Vibrant Neon)
Each ranking tier utilizes a distinct neon color with glowing drop-shadows:
- **Peak (👑/🔥):** `#ff3b5c` (Red/Pink)
- **S Tier (⚡):** `#00f5d4` (Teal/Mint)
- **A Tier (✨):** `#9d4edd` (Deep Purple)
- **B Tier (👍):** `#00b4d8` (Sky Blue)
- **Pending/Unrated (⏳):** `#64748b` (Slate Gray)

## 3. Typography
The typography contrasts an elegant, classic serif for headings with a clean, modern sans-serif for body text. 

- **Headings (Display / Titles):** `'EB Garamond', 'Garamond', Georgia, serif`
  - *Usage:* Story titles, section headers, dramatic labels.
  - *Sizing:* Large, imposing (`3rem` for hero titles, `2rem` for section dividers), tightly tracked (`letter-spacing: -0.02em`).
- **Body & UI Elements:** `'Inter', -apple-system, sans-serif`
  - *Usage:* Descriptions, tooltips, tags, buttons.
  - *Sizing:* Base font-size is compact (`85%` with `zoom: 0.85`) for a dense, high-information layout. Regular text sits around `0.85rem` to `1rem`.
- **Monospace (Data / Metrics):** `'JetBrains Mono', monospace`
  - *Usage:* Numbers, stats, hours of life, metadata badges.

## 4. UI Elements & Shapes

### Glassmorphism & Cards
- Panels, tooltips, and cards should use semi-transparent backgrounds with a backdrop blur (`backdrop-filter: blur(10px)` to `16px`).
- Borders are subtle (`rgba(255, 255, 255, 0.08)`) but glow intensely on hover (e.g., `rgba(147, 51, 234, 0.3)`).
- Elements should have rounded, friendly corners (e.g., `border-radius: 12px` to `18px`).

### Cartoon-y & Playful Elements
- **Icons & Badges:** Heavy use of emoji indicators (👑, 🔥, ⚡, ✨) blended with bold, chunky typography.
- **Separators:** Instead of flat lines, use glowing gradient lines that taper off (`linear-gradient(90deg, [color], transparent)`).
- **Procedural / Organic Shapes:** Avoid perfectly rigid grids when presenting primary data. Incorporate sine-waves, arcs, or overlapping geometric mountain shapes built via CSS `clip-path` to create playful landscapes.

## 5. Animation & Interaction
- **Bounciness:** Hovering over elements (cards, flags, buttons) should feature immediate tactile feedback—translating upward (`translateY(-4px)`), scaling up slightly (`scale(1.1)`), and intensifying drop-shadows.
- **Smoothness:** Utilize CSS transitions (e.g., `transition: all 0.25s ease`) for all interactive elements to ensure nothing feels jittery.
- **Glow Effects:** Hovering should not just change colors but increase the radius and opacity of the element's box-shadow to simulate a neon light turning on.
