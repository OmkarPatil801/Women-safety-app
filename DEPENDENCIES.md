# DEPENDENCIES.md — Women Safety App

Companion to `PROJECT_CONTEXT.md`. Source: `pubspec.yaml` (declared constraints) cross-referenced with `pubspec.lock` (resolved versions actually installed).

---

## Direct dependencies

| Package | Declared constraint | Locked version | Purpose | Where used | Current status | Can it be removed? | Future dependency? |
|---|---|---|---|---|---|---|---|
| `flutter` | sdk | 0.0.0 (sdk) | Core framework | Everywhere | Active | No | Yes |
| `google_maps_flutter` | ^2.5.0 | 2.17.0 | Renders the interactive map | `lib/map_screen.dart` | Active, working (Android only — iOS key not wired) | No | Yes |
| `geolocator` | ^10.0.0 | 10.1.1 | GPS position + permission handling | `lib/main.dart`, `lib/map_screen.dart` | Active, working | No | Yes |
| `url_launcher` | ^6.2.5 | 6.3.2 | Opens the `sms:` URI for the SOS message | `lib/main.dart` (`sendSOS()`) | Active, working | No | Yes |
| `firebase_core` | ^2.0.0 | 2.32.0 | Firebase bootstrap/initialization | **Nowhere** — no `Firebase.initializeApp()` call exists | Declared, unused | Yes, until Firebase work starts | Yes (planned) |
| `cloud_firestore` | ^4.0.0 | 4.17.5 | Cloud NoSQL database client | **Nowhere** — no Firestore read/write exists | Declared, unused | Yes, until Firebase work starts | Yes (planned) |
| `cupertino_icons` | ^1.0.8 | 1.0.9 | iOS-style icon font | **Nowhere** — only `Icons.*` (Material) used throughout | Declared, unused | Yes, safe to remove now | Only if iOS-styled UI is added later |

## Dev dependencies

| Package | Declared constraint | Locked version | Purpose | Where used | Current status |
|---|---|---|---|---|---|
| `flutter_test` | sdk | 0.0.0 (sdk) | Widget testing framework | `test/widget_test.dart` | Present, but the one existing test **does not compile** against this app (see below) |
| `flutter_lints` | ^6.0.0 | 6.0.0 | Recommended lint ruleset | `analysis_options.yaml` (default include, no custom rules) | Active |

---

## Transitive dependencies of note

`pubspec.lock` pulls in a meaningful transitive tree purely from the two unused Firebase packages: `_flutterfire_internals`, `cloud_firestore_platform_interface`, `cloud_firestore_web`, `firebase_core_platform_interface`, `firebase_core_web` — five extra packages resolved and bundled for zero functional benefit today. Removing `firebase_core`/`cloud_firestore` until they're actually needed would shrink the dependency tree and app size with no loss of functionality.

Similarly, `google_maps_flutter` and `geolocator` each pull in their full platform-implementation family (`*_android`, `*_ios`, `*_web`, `*_windows`, plus `google_maps` and `geolocator_platform_interface`) — this is normal/expected for federated Flutter plugins and not a concern.

---

## Unused packages (confirmed by source inspection, not just guessed)

1. **`firebase_core`** — no `import 'package:firebase_core/...'` anywhere in `lib/`.
2. **`cloud_firestore`** — no `import 'package:cloud_firestore/...'` anywhere in `lib/`.
3. **`cupertino_icons`** — no `CupertinoIcons.*` usage anywhere in `lib/`; the app uses `Icons.*` (Material) exclusively, consistent with its `MaterialApp` root and dark Material theme.

## Deprecated packages

None of the current dependencies are deprecated on pub.dev. No action needed on that front.

## Packages that should be upgraded

| Package | Current constraint | Recommendation |
|---|---|---|
| `geolocator` | `^10.0.0` | Bump toward the current 13.x major when convenient — no breaking usage patterns in this codebase (only `checkPermission`/`requestPermission`/`getCurrentPosition` are used, all stable across majors). |
| `google_maps_flutter` | `^2.5.0` | Lockfile already resolves to a newer 2.17.0 within the same major; fine to leave the constraint as-is unless a specific newer feature (e.g. improved marker clustering) is needed. |
| `firebase_core` / `cloud_firestore` | `^2.0.0` / `^4.0.0` | Bump to current majors (Firebase 3.x core / Firestore 5.x) **before** actually wiring up Firebase — no cost to bumping now since they're unused, and it avoids doing a major-version migration on day one of real Firebase work. |

## Recommended immediate cleanup (when the team is ready to modify `pubspec.yaml`)

- Remove `cupertino_icons` now (zero usage, zero planned need until/unless an iOS-styled UI variant is built).
- Either remove `firebase_core`/`cloud_firestore` until Firebase work actually begins, or — if keeping them staged intentionally for near-term work — bump both to current majors now while there's no usage to migrate.

*(No `pubspec.yaml` changes were made as part of this analysis — this section documents recommendations only, per the "analyze, do not modify" instruction.)*
