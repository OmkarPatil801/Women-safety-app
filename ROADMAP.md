# ROADMAP.md — Women Safety App

Companion to `PROJECT_CONTEXT.md` §18. Each task lists estimated complexity, dependencies, files likely to be touched, and potential issues to watch for.

---

## Priority 1 — Fix what's broken today (do first, low effort/risk)

### 1.1 Rotate and restrict the committed Google Maps API key
- **Complexity:** Low (external console work + two file edits).
- **Depends on:** Access to the Google Cloud Console project that owns this key.
- **Files:** `lib/config.dart`, `android/app/src/main/AndroidManifest.xml`, `.gitignore` (add whatever secrets mechanism is chosen).
- **Potential issues:** If the demo device/build isn't re-tested after rotating the key, the Maps screen will silently show a blank/gray map at demo time. Test immediately after rotating.

### 1.2 Fix `test/widget_test.dart`
- **Complexity:** Low.
- **Depends on:** Nothing.
- **Files:** `test/widget_test.dart`.
- **Potential issues:** None significant — the test currently references a nonexistent `MyApp()` class and counter-app assertions that don't apply to this app; it needs to be rewritten to actually exercise `SafetyApp`/`HomeScreen` (e.g., verify the SOS button and "You are Safe" text render).

### 1.3 Add `INTERNET` permission to the main Android manifest
- **Complexity:** Low (one-line XML addition).
- **Depends on:** Nothing.
- **Files:** `android/app/src/main/AndroidManifest.xml`.
- **Potential issues:** None — currently only masked because debug/profile builds auto-add it; a release build would silently fail Maps tile loading without this fix.

---

## Priority 2 — Close functional gaps before wider demoing

### 2.1 Wire up iOS Google Maps key + location usage description
- **Complexity:** Low–Medium.
- **Depends on:** An Apple developer setup for testing (simulator is sufficient for Maps rendering, though location permission prompts behave best on a real device).
- **Files:** `ios/Runner/AppDelegate.swift` (add `GMSServices.provideAPIKey(...)`), `ios/Runner/Info.plist` (add `NSLocationWhenInUseUsageDescription` etc.).
- **Potential issues:** Reusing the same key across Android/iOS requires the key to allow both restriction types in Google Cloud Console, or provisioning a second, iOS-specific key.

### 2.2 Replace the hardcoded SOS number with real, user-managed Emergency Contacts
- **Complexity:** Medium.
- **Depends on:** A decision on interim local storage — even `shared_preferences` would be enough to make this non-hardcoded before Hive/Firebase land; don't block this on the full offline-sync architecture.
- **Files:** `lib/main.dart` (remove hardcoded number, read from a contacts store), new `lib/models/emergency_contact.dart`, new `lib/screens/contacts_screen.dart` (currently just a locked "coming soon" tile).
- **Potential issues:** This directly affects the app's core safety promise — test thoroughly, including the "no contacts saved yet" empty state, before treating SOS as reliable again.

---

## Priority 3 — Real backend foundation

### 3.1 Initialize Firebase and migrate auth
- **Complexity:** Medium–High.
- **Depends on:** A Firebase project (create one, then run `flutterfire configure`).
- **Files:** `lib/main.dart` (add `Firebase.initializeApp()`), new `firebase_options.dart`, `android/app/google-services.json` (new, should be gitignored if it contains anything sensitive — generally safe to commit for Firebase but confirm project policy), replace `AuthState` with Firebase Auth calls throughout `LoginScreen`/`HomeScreen`.
- **Potential issues:** Firebase Auth's phone-auth flow requires reCAPTCHA/SMS-verification setup that's more involved than the current fake login; budget real time for this, it's not a drop-in swap. Preserve the existing product decision that **SOS must keep working without login** — don't gate it behind the new auth system.

### 3.2 Add Hive for offline caching and SOS/report queueing
- **Complexity:** Medium.
- **Depends on:** 3.1 (Firebase) existing as the eventual sync target, though the local boxes themselves could technically be built first.
- **Files:** `pubspec.yaml` (add `hive`, `hive_flutter`, `hive_generator`, `build_runner`), new `lib/local/` folder with box definitions and `@HiveType` models.
- **Potential issues:** Hive requires generated adapter code (`build_runner`) — make sure CI/dev workflow accounts for the codegen step.

---

## Priority 4 — Community + intelligence features

### 4.1 Community incident reporting with map markers
- **Complexity:** Medium–High.
- **Depends on:** Firebase (3.1) for storage.
- **Files:** New `lib/screens/report_screen.dart`, `lib/map_screen.dart` (add marker rendering from `incidentReports`).
- **Potential issues:** Needs basic content moderation/abuse-prevention thinking before public use (rate limiting, flagging) — out of scope for a hackathon MVP but worth flagging early.

### 4.2 Risk heatmap MVP (naive report-density, pre-ML)
- **Complexity:** Medium.
- **Depends on:** 4.1 (need real report data to visualize).
- **Files:** `lib/map_screen.dart` (add a heatmap layer, e.g. via a grid-density approach before any real ML model exists).
- **Potential issues:** Cold-start — with few reports, a heatmap will look sparse/unconvincing; consider seeding with synthetic or public dataset points for demo purposes, clearly labeled as such.

---

## Priority 5 — ML pipeline and production hardening

### 5.1 Python/Flask/Scikit-learn risk-scoring service
- **Complexity:** High.
- **Depends on:** Real report volume or a bootstrapped public dataset (cold-start problem, see `PROJECT_CONTEXT.md` §11).
- **Files:** Entirely new — this does not belong inside the Flutter project directory; scaffold as a separate repository/service with its own `requirements.txt`.
- **Potential issues:** Hosting decision not yet made anywhere in project docs; model-serving latency/cost tradeoffs; needs a clear boundary so the Flutter client never depends on this service's uptime in its critical (SOS) path.

### 5.2 Production release hardening
- **Complexity:** Low–Medium.
- **Depends on:** Nothing — can happen in parallel with any of the above.
- **Files:** `android/app/build.gradle.kts` (real signing config), new gitignored `android/app/key.properties`, `applicationId`/`namespace` change away from `com.example.*`, branded launcher icon assets.
- **Potential issues:** Changing `applicationId` after any real-world install would be treated as a different app by users/app stores — do this early, before any public distribution, not after.

---

## Cross-cutting risks to watch across the whole roadmap

- **SMS delivery is manual, not automatic** — if this is presented as a finished "emergency alert system," the manual-tap-to-send step should either be clearly disclosed or replaced with a Twilio-based automatic send before any serious claim of reliability is made.
- **Cold-start problem for the ML model** — there is no data to train on until community reporting has real usage; sequence 4.1 well before 5.1.
- **iOS has been fully deferred so far** — expect real, non-trivial catch-up work (this roadmap's 2.1 is only the Maps piece; broader iOS QA has not happened at all yet based on the current codebase).
