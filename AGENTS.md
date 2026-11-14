# TRADESCOUT — Visual & Design System Contract (AGENTS.md)

This contract defines the strict visual design language, component tokens, density standards, and behavioral guardrails for all TRADESCOUT frontend development. All agents, engineers, and automated workflows modifying `frontend/` must adhere to these specifications without deviation.

---

## 1. Typography & Numerics
- **Primary Font Family:** `Hanken Grotesk` via `--font-hanken` (`font-sans`), falling back to `Inter, system-ui, -apple-system, sans-serif`.
- **Tabular Numerics (`tabular-nums`):**
  - **MANDATORY:** Apply `tabular-nums` (`font-variant-numeric: tabular-nums`, or utility class `.tnum` / `tabular-nums`) to:
    - Stock prices (LTP, open, high, low, close)
    - Percentage changes (`+2.45%`, `-1.12%`)
    - RS Ratings (0–99), Momentum scores, and Volume ratios
    - Financial statement rows (Quarterly Sales, Expenses, OPM%, PAT, EPS)
    - All table cells displaying numbers or currency
  - Purpose: Prevents jitter during live price updates and guarantees clean vertical column alignment.

---

## 2. Color Tokens & Dark-Mode Default
TRADESCOUT defaults to Dark Mode (`<html class="dark">`), persisted via `localStorage.getItem("stc-theme")`.

| Token Role | Hex Code | Tailwind / CSS Variable | Description |
| :--- | :--- | :--- | :--- |
| **Bg Primary** | `#0a0a0f` | `bg-background` / `--background` | Deep midnight canvas |
| **Bg Secondary / Sidebar** | `#141420` | `bg-[#141420]` / `bg-muted` | Institutional dark side panel & secondary bars |
| **Card Surface** | `#1c1c2e` | `bg-card` / `bg-surface` | Modular Bento card surfaces |
| **Subtle Borders** | `#27272a` | `border-border` / `border-[#27272a]` | Crisp 1px card and grid boundaries |
| **Primary Accent** | `#6366f1` | `text-primary` / `bg-primary` | Signature Indigo accent for actions & active pills |
| **Bullish / Leading** | `#22c55e` | `text-bull` / `text-emerald-500` | Stage 2 Markup, RS >= 80, positive changes |
| **Bearish / Lagging** | `#ef4444` | `text-bear` / `text-rose-500` | Stage 4 Decline, distribution days, negative changes |
| **Caution / Pivot** | `#f59e0b` | `text-amber-500` / `border-amber-500` | Pivot lines, Stage 1 Base, Stage 3 Top |
| **Primary Text** | `#e4e4e7` | `text-foreground` / `text-zinc-200` | High-contrast readable labels and titles |
| **Secondary Text** | `#a1a1aa` | `text-muted-foreground` / `text-zinc-400` | Metadata, subtitles, column headers, units |

---

## 3. Density, Layout & Bento Grid System
- **Density:** Compact institutional layout.
  - Cards: `p-3` or `p-4` padding, rounded `rounded-xl` or `rounded-2xl`.
  - Tables: `py-1.5 px-3` or `py-2 px-3` compact rows for high information density.
  - Headers: Sticky table headers (`sticky top-0 z-10 bg-card/95 backdrop-blur-xs`).
  - Mobile: Sticky Symbol column on horizontal scroll views.
- **Bento Hierarchy:**
  - Standard dashboards (Warm-up, Intraday, Markets) use 3-column asymmetric Bento arrangements.
  - Top fold highlights critical regime gauges (RME Sentiment Gauge, Breadth Participation Radial, Weinstein Stage Distribution).
- **Navigation Geometry:**
  - Desktop (`lg+`): Crisp fixed left sidebar (`240px` or compact `64px` icon dock with expanding tooltips and labels).
  - Mobile (`< lg`): Fixed bottom bar (`56px`, `h-14`) with active route pills and icons.

---

## 4. Shimmer Skeletons & Micro-Interactions
- **Zero Blank States:** NEVER render empty blank white/black screens or raw spinner circles during data loads.
- **Framer Motion Shimmer:** Use Framer Motion animated skeleton placeholders (`bg-zinc-800/50 animate-pulse` or gradient shimmer) matching the exact dimensions of incoming cards/tables.
- **Row Hovers:** Table rows must feature subtle background highlights (`hover:bg-white/[0.03]` or `hover:bg-primary/[0.06]`).
- **Keyboard Navigation:** Tables support `ArrowUp` / `ArrowDown` navigation to move row focus and `Enter` to navigate to `/stock/[symbol]`.

---

## 5. Regulatory & Compliance Guardrails
- **No Advisory Words:** Under NO circumstances should any UI element, prompt, badge, or notification use advisory signals:
  - BANNED: `BUY`, `SELL`, `TARGET`, `STOP LOSS`, `RECOMMENDATION`, `MULTIBAGGER`.
  - ALLOWED: `Pivot Point`, `Stage 2 Markup`, `50 EMA Pullback`, `Pocket Pivot`, `RS > 80`, `VCP Contraction`.
- **Mandatory SEBI Notice:** Every financial view, dashboard, and footer must display:
  `"TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk."`
- **Zero Mock / Placeholder Code:** Every component must connect to real data stores (Polars parquet streams, Supabase Postgres, or local indexed data) with robust fallback handling.
