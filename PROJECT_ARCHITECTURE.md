# PROJECT_ARCHITECTURE.md — Women Safety App

Companion to `PROJECT_CONTEXT.md` §12. Expanded architecture diagrams and data-flow detail.

---

## Current architecture (verified against source, as of this analysis)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Flutter Mobile App                          │
│                  (Android verified working;                     │
│                   iOS Maps key NOT wired up)                    │
│                                                                   │
│   ┌───────────────┐                                              │
│   │  AuthState    │  static, in-memory only, process-lifetime.   │
│   │  (main.dart)  │  No persistence — restart = all users lost.  │
│   └───────┬───────┘                                              │
│           │ read/write                                           │
│   ┌───────▼────────────────────┐      ┌─────────────────────┐   │
│   │       HomeScreen           │◄────►│    LoginScreen       │   │
│   │  - SOS button (tap)        │ push │  - Sign In tab       │   │
│   │  - Long-press → MapScreen  │ /pop │  - Register tab      │   │
│   │  - 4 feature tiles         │      │  - writes AuthState  │   │
│   │    (3 of 4 are stubs)      │      └─────────────────────┘   │
│   └───────┬─────────────────────┘                                │
│           │ sendSOS()                                            │
│           ▼                                                      │
│   ┌────────────────┐      ┌──────────────────┐                  │
│   │   Geolocator    │─────►│  Position (lat,  │                  │
│   │  (device GPS)   │      │  lng) one-shot   │                  │
│   └────────────────┘      └────────┬─────────┘                  │
│                                     ▼                             │
│                        ┌────────────────────────┐                │
│                        │  sms: URI construction  │                │
│                        │  (Maps link embedded)   │                │
│                        └───────────┬────────────┘                │
│                                     ▼                             │
│                        ┌────────────────────────┐                │
│                        │  url_launcher.launchUrl │                │
│                        └───────────┬────────────┘                │
│                                     ▼                             │
│                        ┌────────────────────────┐                │
│                        │  Device's default SMS   │                │
│                        │  app opens, prefilled.   │                │
│                        │  USER MUST TAP SEND —    │                │
│                        │  not automatic.          │                │
│                        └────────────────────────┘                │
│                                                                   │
│   ┌─────────────────────────────┐                                │
│   │        MapScreen             │                                │
│   │  - getLocation() (Geolocator)│                                │
│   │  - GoogleMap widget           │                                │
│   │  - No markers/overlays yet    │                                │
│   └───────┬───────────────────────┘                              │
│           │ reads key from                                        │
│           ▼                                                       │
│   AndroidManifest.xml meta-data (com.google.android.geo.API_KEY)  │
│   (lib/config.dart's constant is imported but unused — dead code) │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

     NO backend. NO network layer besides Google Maps tiles.
     NO persistence layer of any kind.
```

**Key architectural characteristics today:**
- Everything is client-only; the only "external service" touched is the Google Maps SDK (tile rendering) and the device's own SMS app.
- No repository/service abstraction layer — screens call `Geolocator`/`url_launcher`/`google_maps_flutter` APIs directly inline.
- No dependency injection, no state management library — plain `StatefulWidget` + `setState`.
- `AuthState` acts as a makeshift global singleton (static fields) rather than a proper app-level state container — acceptable at this scale, but should not be the pattern extended further.

---

## Future architecture (planned, synthesizing README + this analysis — not yet built)

```
┌───────────────────────────────────────────────────────────────────────┐
│                          Flutter Client                                │
│                                                                          │
│   Firebase Auth  ◄──────────────►  replaces in-memory AuthState        │
│         │                                                               │
│         ▼                                                               │
│   ┌─────────────┐        online         ┌─────────────────────────┐   │
│   │  Hive (local)│◄──────sync──────────►│  Firestore (cloud)       │   │
│   │  - contacts   │   pending queue      │  - users/{uid}           │   │
│   │  - pending SOS│   flush on           │  - sosEvents/{id}        │   │
│   │  - pending     │   connectivity      │  - incidentReports/{id}  │   │
│   │    reports     │   restore           │  - riskZones/{id}        │   │
│   └─────────────┘                        └────────────┬────────────┘   │
│                                                          │               │
│   ┌──────────────────────────┐                          │ reads         │
│   │  MapScreen (enhanced)     │◄─────────────────────────┘               │
│   │  - GoogleMap                                                         │
│   │  - Markers for reports                                               │
│   │  - Heatmap layer (riskZones)                                         │
│   │  - Safe-route polylines (future)                                     │
│   └──────────────────────────┘                                          │
└───────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ riskZones written by
                                    │
                    ┌───────────────────────────────────┐
                    │   External ML pipeline (separate    │
                    │   service — Python/Flask)            │
                    │                                       │
                    │  incidentReports (read from Firestore)│
                    │        ↓                               │
                    │  Pandas preprocessing                  │
                    │        ↓                               │
                    │  Feature engineering (grid cell,        │
                    │  time-of-day, report density)           │
                    │        ↓                               │
                    │  Scikit-learn model                     │
                    │        ↓                               │
                    │  Risk score per cell                    │
                    │        ↓                               │
                    │  Write back to Firestore riskZones      │
                    └───────────────────────────────────┘
```

---

## Data flow — offline (planned)

1. User opens the app with no connectivity.
2. SOS still works unmodified — Geolocator and the `sms:` URI launcher are both local device APIs, not network calls.
3. Any new emergency contact edit, or a new incident report the user tries to submit, gets written to the appropriate **Hive box** instead of Firestore, flagged as pending.
4. The UI should reflect a "queued, will sync when online" state for these actions (not yet designed).

## Data flow — online (planned)

1. Connectivity listener (e.g., via `connectivity_plus`, not yet a dependency) detects a network is available.
2. A sync routine iterates pending Hive boxes and pushes each entry to the corresponding Firestore collection.
3. On successful write, the entry is removed from the local pending box.
4. `riskZones` and `incidentReports` become live-readable from Firestore, feeding the map's heatmap/markers layer.

## Synchronization strategy (planned, not yet designed in detail)

- Last-write-wins is likely sufficient given the write patterns involved (a user only edits their own contacts; incident reports are append-only, not edited after creation) — no complex conflict resolution appears necessary based on the data shapes sketched in `PROJECT_CONTEXT.md` §9.
- Firestore's built-in offline persistence (`persistenceEnabled: true`) could reduce how much of this Hive/sync logic needs to be hand-rolled, once Firebase is actually wired up — worth evaluating whether Hive is even needed for *cloud-mirrored* data, versus reserving it purely for local-only state (like the pending-queue itself, and session persistence).

## Backend, ML, and Maps — how they'll relate

- **Backend (Firebase):** primary data store and auth provider; the client talks to it directly, no custom API server needed for the "CRUD" parts of the app (contacts, reports, auth).
- **ML (Python/Flask/Scikit-learn):** a **separate, offline batch process** (or occasionally-invoked service) that reads from Firestore, computes risk scores, and writes back to Firestore. The Flutter client should **not** call the Flask service directly in the hot path — reading precomputed `riskZones` from Firestore keeps the mobile app's critical path free of a dependency on the ML service's uptime.
- **Maps:** purely a rendering layer — it consumes whatever markers/heatmap data the app already has (from Firestore), it does not itself compute risk.
