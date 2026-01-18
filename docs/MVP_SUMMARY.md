# ForOffensiveCoordinator MVP - Complete Feature Summary v2.0

> Last Updated: 2026-01-18

## Overview

ForOffensiveCoordinator is a football play diagramming tool designed for coaches. Create professional play diagrams in under 3 minutes with context-aware concept recommendations and auto-build functionality.

---

## Core Features

### 1. Play Editor

| Feature | Status | Notes |
|---------|--------|-------|
| SVG-based field rendering | Done | FIELD_WIDTH/HEIGHT constants |
| Player drag & drop | Done | 11 players |
| Action system | Done | Route, Block, Motion, Text, Landmark |
| Multi-select (Shift+Click) | Done | selectedPlayerIds[], selectedActionIds[] |
| Bulk Delete (Del/Backspace) | Done | removeSelectedActions() |
| Copy/Paste (Ctrl+C/V) | Done | useClipboard hook, cross-tab support |
| Alignment Guides | Done | Snap guides on drag |
| Undo/Redo (Ctrl+Z/Y) | Done | History stack |
| Player Grouping (OL/Backs/WR) | v1.1 | Currently individual selection only |
| WR Split Presets (Wide/Slot) | v1.1 | Replaced by Alignment Guides |

### 2. Auto-Build System

| Feature | Status | Notes |
|---------|--------|-------|
| Concept-based auto generation | Done | buildPlayFromConcept() |
| Formation validation | Done | Required role checks |
| Split Receiver check | Done | 7 on LOS rule |
| Error/Warning system | Done | BuildError, warnings[] |
| Replace vs Append | Done | Append + Undo policy (preserves existing actions) |

### 3. Suggestions Panel

| Feature | Status | Notes |
|---------|--------|-------|
| Context-based recommendations | Done | playType, boxCount, front |
| Why explanations (3 lines) | Done | reasons[] |
| Install Focus connection | Done | drills, coachingPoints |

---

## Playbook System

### 4. Playbook Management

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-section Playbooks | Done | sections[] with plays |
| Tags & Filters | Done | Tag-based organization |
| Play Statistics | Done | Usage tracking |
| Playbook List View | Done | /playbooks route |

### 5. Install Plan Generator

| Feature | Status | Notes |
|---------|--------|-------|
| Day-based planning | Done | Install schedule |
| Coaching emphasis | Done | Focus points per session |
| Drill links | Done | Connected to concepts |
| Season Entity | Non-goal | MVP is Week-based only |

---

## Formation System

### 6. Formation Panel

| Feature | Status | Notes |
|---------|--------|-------|
| Formation presets | Done | 12+ templates |
| Personnel display | Done | 11/12/21 etc. |
| Context-based recommendations | Done | Context-aware |

### 7. Formation Packages

| Package | Description | Status |
|---------|-------------|--------|
| Trips | 3 WR to one side | Done |
| Bunch | Tight cluster | Done |
| Empty | No RB | Done |
| 12 Personnel | 1 RB, 2 TE | Done |
| Motion-based | Pre-snap motion | Done |

> Same philosophy, different responses - includes per-package recommendation explanations

---

## Data & Persistence

### 8. Autosave System

| Feature | Status | Notes |
|---------|--------|-------|
| Local Draft | Done | localStorage fallback |
| Cloud Sync | Done | Server sync when online |
| Offline Support | Done | Work offline |
| Conflict Resolution | Done | Local/Server conflict handling |

### 9. Save Status Indicator

| State | Visual | Status |
|-------|--------|--------|
| Saved | Green checkmark | Done |
| Saving | Spinner | Done |
| Unsaved | Yellow warning | Done |
| Offline | Gray icon | Done |

---

## Export & Share

### 10. Export System

| Feature | Status | Notes |
|---------|--------|-------|
| PNG Export | Done | 2x scale, high-res |
| PDF Export | Done | Playbook PDF |
| 10 Page Limit | Done | Per plan tier |
| Telemetry tracking | Done | export_png, export_pdf |
| Plan limit check | Done | maxExports |
| Overlay Options | Done | Defense/Landmarks toggle |

### 11. Share System

| Feature | Status | Notes |
|---------|--------|-------|
| View-only links | Done | Token-based |
| View + Download | Done | Per plan tier permission |
| Fork functionality | Done | Copy to own workspace |
| Watermark | Done | "Shared via ForOffenseCoach" |
| Attribution | Done | "Powered by ForOffenseCoach" |

### 12. Share Viewer (Mobile-optimized)

| Feature | Status | Notes |
|---------|--------|-------|
| Touch Gestures | Done | useTouchGestures hook |
| Pinch Zoom/Pan | Done | 0.5x - 3x scale |
| Fullscreen Mode | Done | Mobile fullscreen |
| View Options | Done | Defense/Labels/Landmarks |

---

## Monetization

### 13. Plan Tier System

| Tier | Plays | Playbooks | Exports | Concepts | Download Share |
|------|-------|-----------|---------|----------|----------------|
| Free | 5 | 1 | 10/mo | Core 15 | View only |
| Team | 50 | 10 | 100/mo | +Team Pack | Yes |
| Season | Unlimited | Unlimited | Unlimited | All Packs | Yes |

### 14. Usage Tracking

| Component | Description | Status |
|-----------|-------------|--------|
| PlanBadge | Current tier display | Done |
| UsageIndicator | Usage progress bar | Done |
| UpgradePrompt | Modal on limit reached | Done |

### 15. Concept Packs

| Pack | Concepts | Price | Status |
|------|----------|-------|--------|
| Core | 15 basic | Free | Done |
| Team | +15 | $19/mo | Done |
| Season | All | $49/mo | Done |

---

## Analytics & Telemetry

### 16. Telemetry System (24 Events)

```
Pre-Context:     intent_selected, context_initialized, context_adjusted
Onboarding:      onboarding_completed, onboarding_skipped, first_play_created
Suggestions:     suggestions_opened, concept_clicked, why_viewed
Formation:       formation_reco_shown, formation_reco_selected, formation_applied
Auto-build:      autobuild_success, autobuild_fail, undo_after_autobuild
Validation:      validation_error_viewed, export_blocked_by_validation
Export:          export_png, export_pdf, export_overlay_mode_selected
Share:           share_link_created, share_view_opened, fork_created
Install Focus:   install_focus_opened, drill_video_clicked
```

### 17. Session Tracking

| Feature | Status |
|---------|--------|
| Session ID | Done |
| Debounce/Dedup | Done |
| Error Reporting | Done (Sentry ready) |
| KPI Dashboard | Done |

---

## DSL Specification

### 18. Coordinate System

```
+----------------------------------+
|          OFFENSE (+Y)            |
|               ^                  |
|               |                  |
|  <----------- LOS ------------>  |  y = 0
|            (y = 0)               |
|               |                  |
|               v                  |
|          DEFENSE (-Y)            |
+----------------------------------+

x: 0.0 (left) -> 1.0 (right)  // Normalized
y: 0.0 (LOS) -> +/-0.5 (end zones)
```

### 19. Schema Versioning

| Property | Value | Notes |
|----------|-------|-------|
| schemaVersion | "1.0" | Fixed for MVP |
| Migration | Deferred | Planned for v1.1 |

```typescript
interface Play {
  schemaVersion: "1.0";  // Fixed for MVP
  id: string;
  name: string;
  players: Player[];
  actions: Action[];
  // ...
}
```

---

## Quality Assurance

### 20. E2E Tests (Playwright)

| Test File | Coverage |
|-----------|----------|
| activation-flow.spec.ts | Onboarding -> First play |
| editor.spec.ts | Full editor functionality |
| export.spec.ts | PNG/PDF export |
| mobile.spec.ts | Mobile UX |
| suggestions.spec.ts | Recommendation system |

### 21. Validation System

| Level | Description | Status |
|-------|-------------|--------|
| Error | Blocking (no export) | Done |
| Warning | Warning (export allowed) | Done |
| Info | Information | Done |

---

## KPI Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Activation Rate | 30%+ | Visit -> First play created |
| 3-min Success Rate | 50%+ | Landing -> Auto-build -> Export <= 3min |
| Day-7 Retention | 20%+ | Return after 7 days |
| Export Rate | 50%+ | Play created -> Export |
| Free -> Paid | 5%+ | Paid conversion rate |

---

## Explicitly Non-Goal (MVP Exclusions)

| Feature | Reason | Target |
|---------|--------|--------|
| Player Grouping (OL/WR unit) | Replaced by multi-select | v1.1 |
| WR Split Preset buttons | Replaced by Alignment Guides | v1.1 |
| Replace existing actions option | Adopted Append + Undo policy | - |
| Season Entity | MVP is Week-based only | v2.0 |
| DSL Migration | schemaVersion 1.0 fixed | v1.1 |
| Weekly Content Loop | Replaced by Concept Pack | v1.1 |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + React 18 |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | Prisma + PostgreSQL |
| Auth | NextAuth.js (ready) |
| Testing | Playwright (E2E) |
| Telemetry | Custom + KPI Dashboard |

---

## Final Stats

| Metric | Value |
|--------|-------|
| Files Changed | 36+ |
| Lines Added | ~4,000+ |
| Event Types | 24 |
| Test Files | 5 |
| MVP Completion | 99%+ |
