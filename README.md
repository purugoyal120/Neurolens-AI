# NeuroLens AI — Personalized Vision Layer

An accessibility tool that builds a **personal color-perception profile** for each
color-blind user (via a 2-minute interactive test), then uses that profile to
**transform digital interfaces** — Excel, websites, dashboards, mobile apps, maps —
so that meaning is never lost to color alone.

The key design idea: most color-blind tools apply ONE static filter (e.g. generic
Daltonization) to everyone. NeuroLens instead:

1. Measures *this specific person's* perception with a short test
2. Builds a quantitative "vision map" (per-hue confusion + severity + type)
3. Uses that map to drive two layers of adaptation:
   - **Color remapping** — shift colors into a part of the spectrum this user can
     actually discriminate
   - **Meaning replacement** — attach icons/patterns/text so meaning survives
     even if the color shift isn't perfect (✅ / ⚠ / ❌ instead of 🟢 / 🟡 / 🔴)

## Monorepo layout

```
neurolens-ai/
├── frontend/                 React + TypeScript web app
│   ├── src/
│   │   ├── components/
│   │   │   ├── VisionTest/   The 2-minute interactive test UI
│   │   │   ├── Dashboard/    Profile summary, "your vision map"
│   │   │   └── TransformPreview/  Live before/after demo (Excel/web/map)
│   │   ├── pages/            Route-level screens
│   │   ├── hooks/            useVisionTest, useTransformEngine, etc.
│   │   ├── api/              Typed fetch client for the FastAPI backend
│   │   ├── types/            Shared TS types (mirrors backend Pydantic schemas)
│   │   ├── utils/            Color math helpers shared by UI components
│   │   └── styles/           Design tokens (see docs/design-system.md)
│   └── public/
│
├── backend/                  FastAPI service — profiling + persistence
│   ├── app/
│   │   ├── api/              Route handlers (REST endpoints)
│   │   ├── schemas/          Pydantic request/response models
│   │   ├── models/           SQLAlchemy ORM models (DB tables)
│   │   ├── services/         Business logic (test scoring, profile building)
│   │   ├── ml/                Vision-mapping model (perception estimator)
│   │   ├── db/                Session/engine setup, migrations
│   │   └── core/              Config, constants (color test stimuli, etc.)
│   └── tests/
│
├── engine/                    Color Transformation Engine — framework-agnostic
│   ├── src/                   Core TS logic: works in browser, Node, or
│   │                          compiled to WASM later. This is the package both
│   │                          the web app and (eventually) a browser extension
│   │                          / Excel add-in / mobile app import.
│   └── tests/
│
└── docs/                      Architecture notes, vision-map spec, roadmap
```

## Why split `engine/` from `frontend/`?

The transformation engine (color remapping + meaning replacement) needs to run in
very different hosts over time: a React web app today, a browser extension or
Excel/Office add-in next, a mobile app and AR camera overlay later. Keeping it as
a standalone, dependency-light TypeScript package (no React import) means the same
core logic can be embedded anywhere a JS engine exists, and is also the natural
candidate to later compile to WASM for performance-critical camera-frame
processing.

## Data flow (end to end)

```
User takes test (frontend/VisionTest)
        │
        ▼
POST /api/v1/profile/test-results  (raw responses)
        │
        ▼
backend/app/services/profile_builder.py
        │   uses backend/app/ml/vision_model.py
        ▼
Vision Map persisted (backend/app/models/vision_profile.py)
        │
        ▼
GET /api/v1/profile/{user_id}/vision-map
        │
        ▼
frontend loads vision map → engine/src/transform.ts
        │
        ▼
Any interface (Excel export, web page, dashboard, map) gets
color + meaning transformed using that map
```

## Status of this deliverable

This first pass implements, end-to-end and runnable:
- [x] Project structure (this document)
- [x] Vision Profile Test Module (frontend component + backend endpoints)
- [x] Sample AI/ML model for vision mapping (Python, trainable + rule-based fallback)
- [x] Color Transformation Engine (TypeScript, used by frontend; Python port for
      server-side/Excel use)
- [x] API endpoints for profile creation + transformation
- [x] Basic React UI for the test interface

Not yet implemented (flagged in `docs/roadmap.md`): live AR/camera overlay,
production WASM build, Excel/Office add-in packaging, PostgreSQL migration.

## Two Vision Profile Test modules

This repo currently contains **two parallel implementations** of the Vision
Profile Test, built to two different specs at different points in the
project:

| | "Extended" module | "Simple" module |
|---|---|---|
| Frontend | `frontend/src/components/VisionTest/` | `frontend/src/components/SimpleVisionTest/` |
| State mgmt | custom hook (`useVisionTest`) | React Context (`VisionTestContext`) |
| Backend routes | `/api/v1/profile/*` | `/api/vision-test/*`, `/api/vision-profile/*` |
| DB table | `vision_profiles` (column-per-field) | `simple_vision_profiles` (JSON blob) |
| Question count | 12 trials (incl. same/different discrimination) | 10 multiple-choice questions |
| Vision-map shape | `per_hue_discrimination` (12 hue buckets) | `perception_scores` (4 primary colors) + `recommended_transformations` |
| Scoring | Lab-space confusion-line geometry | flat predefined confusion matrix |

Both are fully wired, tested, and runnable simultaneously (`App.tsx` has a
toggle in the corner to switch between them) — they don't conflict, since
each has its own routes and DB table. See `docs/roadmap.md` for the plan to
consolidate these into one module once the team picks a direction.
