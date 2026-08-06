import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/app_user.dart';

/// Wraps Firebase Authentication + the `users` Firestore collection.
///
/// This is the only file in the project that calls `FirebaseAuth`/
/// `FirebaseFirestore` for sign-in/sign-up. `AuthState` (`lib/main.dart`)
/// is a thin compatibility wrapper around this service — every existing
/// call site (`LoginScreen`, `HomeScreen`, `_AuthCard`) keeps its exact
/// current shape and never talks to Firebase directly.
///
/// The existing Login/Register UI only ever collects a phone number, not
/// an email — but Firebase's email/password sign-in requires an email.
/// [_syntheticEmail] bridges that gap by deriving a stable, internal-only
/// address from the phone number; it is never shown in any UI and never
/// written to Firestore's real `email` field.
class AuthService {
  AuthService({FirebaseAuth? auth, FirebaseFirestore? firestore})
      : _auth = auth ?? FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;

  static const _syntheticEmailDomain = 'womensafetyapp.local';

  String _syntheticEmail(String phone) => '$phone@$_syntheticEmailDomain';

  /// Signs in with the phone/password the Login form collects. Returns
  /// the signed-in [AppUser], or null if the credentials are invalid.
  Future<AppUser?> login(String phone, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: _syntheticEmail(phone),
        password: password,
      );
      final user = credential.user;
      if (user == null) return null;
      return _loadProfile(user);
    } on FirebaseAuthException {
      return null;
    }
  }

  /// Creates a Firebase Auth account and its `users/{uid}` Firestore
  /// profile document. Returns the new [AppUser], or null if
  /// registration fails (e.g. phone already registered, weak password).
  Future<AppUser?> register(
      String name, String phone, String password) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: _syntheticEmail(phone),
        password: password,
      );
      final user = credential.user;
      if (user == null) return null;

      final appUser = AppUser(
        uid: user.uid,
        name: name,
        phone: phone,
        createdAt: DateTime.now(),
      );
      await _firestore
          .collection('users')
          .doc(user.uid)
          .set(appUser.toFirestore());
      return appUser;
    } on FirebaseAuthException {
      return null;
    }
  }

  Future<void> logout() => _auth.signOut();

  /// Restores the signed-in user on app startup if Firebase already has
  /// a persisted session — this is what makes login survive a restart.
  /// Returns null if nobody is currently signed in.
  Future<AppUser?> restoreSession() async {
    final user = _auth.currentUser;
    if (user == null) return null;
    return _loadProfile(user);
  }

  Future<AppUser> _loadProfile(User firebaseUser) async {
    final doc =
        await _firestore.collection('users').doc(firebaseUser.uid).get();
    final data = doc.data();
    if (data != null) {
      return AppUser.fromFirestore(firebaseUser.uid, data);
    }
    // Defensive fallback — only reachable if a Firestore doc was deleted
    // out-of-band while the Auth account still exists.
    return AppUser(
      uid: firebaseUser.uid,
      name: firebaseUser.email ?? 'User',
      createdAt: DateTime.now(),
    );
  }
}
