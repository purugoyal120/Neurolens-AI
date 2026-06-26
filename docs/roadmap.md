# Roadmap

## Done in this pass (deliverable 1 of N)

- [x] Monorepo structure: `frontend/`, `backend/`, `engine/`, `docs/`
- [x] Color science spec (`docs/vision-map-spec.md`) — the test design and
      VisionMap data model everything else implements against
- [x] Backend: confusion-line-based test stimuli generator, Lab↔sRGB
      conversion, rule-based scoring model, FastAPI endpoints, SQLite
      persistence — all tested (13 passing tests, unit + HTTP integration)
- [x] Frontend: typed API client, `useVisionTest` state machine, trial UI
      (discrimination + identification trial types), progress indicator,
      results screen with the radial "vision map" dial, full design-token
      system — builds clean with `tsc` + `vite build`
- [x] Verified live end-to-end: FastAPI server + Vite dev server + proxy,
      real HTTP round trip from test submission to persisted profile

## Next (not yet built — flagged explicitly, not implied as done)

1. **Color Transformation Engine — core algorithm: DONE, both languages.**
   See previous entries; unchanged.
2. **AI Context Replacement Enhancement — DONE, both languages, this pass.**
   - `engine/python/semantic_detector.py` + `engine/js/semanticDetector.js`:
     rule-based signal fusion (text keywords + color + DOM context ->
     label + confidence), the production detector. 43 Python unit tests +
     1 cross-language parity test (18 cases, byte-identical).
   - `engine/python/semantic_detector_net.py`: PyTorch architecture for the
     brief's requested neural model, explicitly NOT the production path —
     no real 10,000+-example labeled dataset exists to train it on
     honestly. Genuinely trains, converges, saves/loads, stays under the
     500KB budget (389 params, ~1.5KB raw) — validated on synthetic data
     so the pipeline itself is proven, not just stubbed.
   - `engine/python/train_semantic_model.py` +
     `engine/python/semantic_color_dataset.csv`: real, runnable training
     script + a small (79-row) hand-written illustrative dataset — clearly
     flagged as illustrative, not the fabricated-10k-rows version that
     would look impressive and mean nothing.
   - `engine/js/contextReplacer.js` (`ContextReplacementEngine`): the
     brief's exact requested class shape (`detectSemantic`,
     `replaceWithIcon`, `addPattern`, `applyToPage`), with memoization,
     batched DOM processing, confidence thresholding, and custom
     color->meaning mappings. 19 passing Node-native unit tests.
   - `engine/js/patterns.js`: subtle CSS gradient patterns for the
     financial gain/loss visualization.
   - See `docs/semantic-detector-spec.md` for full design rationale.
3. **Platform integrations** — Chrome extension, Excel add-in, JS SDK,
   React Native SDK, Maps overlay. Not yet built; these consume
   `engine/js/transformer.js` + `engine/js/contextReplacer.js` (or the
   Python equivalents for server-side batch use).
4. **Settings UI for custom mappings** (brief item 7's "Settings UI: List
   of custom mappings, Add/edit/delete, save to vision profile") — the
   underlying `customMappings` support exists in `ContextReplacementEngine`
   today; only the UI for managing them is unbuilt.
5. **Sample integrations** — a demo page showing the engine applied to: a
   mock dashboard, a mock spreadsheet grid, a mock map legend.
6. **AR / camera mode** — TensorFlow.js + WebRTC live frame processing.
7. **Trained neural scorer(s)** — both `VisionMapNet`
   (`backend/app/ml/vision_model.py`) and `SemanticDetectorNet`
   (`engine/python/semantic_detector_net.py`) are wired up and
   unit-testable on synthetic data, but need real labeled data before
   replacing their rule-based counterparts in production.
8. **Auth & multi-user** — current `user_id` is just a string the client
   sends; no auth layer yet. Fine for a prototype, not for shipping.
9. **PostgreSQL migration** — swap `DATABASE_URL`, add Alembic migrations
   before this leaves SQLite.

## Explicitly out of scope for now

- Clinical-grade diagnosis (this is a screening tool; the UI says so)
- WASM compilation of the transform engine (premature until the JS version
  has a real performance problem)
