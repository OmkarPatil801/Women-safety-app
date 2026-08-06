import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

/// Handles all Firebase Authentication and Firestore user-profile logic.
///
/// **Phone → Dummy-Email workaround**
/// Firebase does not support Phone + Password as a native sign-in method.
/// We convert the user's phone number into a dummy email address
/// (`{phone}@womensafety.app`) and use Email/Password auth behind the
/// scenes.  The UI never exposes this — users continue to type their
/// phone number and password as before.
class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ── Helpers ──────────────────────────────────────────────────────────

  /// Converts a phone number to the dummy email used by Firebase Auth.
  String _phoneToEmail(String phone) => '$phone@womensafety.app';

  // ── Public API ───────────────────────────────────────────────────────

  /// The currently signed-in Firebase user, or `null`.
  User? get currentUser => _auth.currentUser;

  /// A broadcast stream that emits whenever the auth state changes
  /// (sign-in, sign-out, token refresh).  Used by [AuthGate] in
  /// `main.dart` to drive persistent login.
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // ── Registration ─────────────────────────────────────────────────────

  /// Creates a new Firebase Auth account and writes the user profile to
  /// the `users` collection in Cloud Firestore.
  ///
  /// Returns `null` on success, or a human-readable error message.
  Future<String?> register({
    required String name,
    required String phone,
    required String password,
  }) async {
    try {
      // 1. Create the Firebase Auth user
      final credential = await _auth.createUserWithEmailAndPassword(
        email: _phoneToEmail(phone),
        password: password,
      );

      final uid = credential.user!.uid;

      // 2. Set the display name so we can read it without a Firestore
      //    round-trip when the app cold-starts.
      await credential.user!.updateDisplayName(name);

      // 3. Write the user profile to Firestore
      await _firestore.collection('users').doc(uid).set({
        'uid': uid,
        'name': name,
        'phone': phone,
        'createdAt': FieldValue.serverTimestamp(),
      });

      return null; // success
    } on FirebaseAuthException catch (e) {
      print('🔴 FirebaseAuthException during register: code=${e.code}, message=${e.message}');
      return _mapAuthError(e.code);
    } on FirebaseException catch (e) {
      print('🔴 FirebaseException during register: code=${e.code}, message=${e.message}');
      return _mapAuthError(e.code);
    } catch (e) {
      print('🔴 Unknown error during register: $e');
      return 'An unexpected error occurred: ${e.toString()}';
    }
  }

  // ── Login ────────────────────────────────────────────────────────────

  /// Signs in an existing user with their phone number and password.
  ///
  /// Returns `null` on success, or a human-readable error message.
  Future<String?> login({
    required String phone,
    required String password,
  }) async {
    try {
      await _auth.signInWithEmailAndPassword(
        email: _phoneToEmail(phone),
        password: password,
      );
      return null; // success
    } on FirebaseAuthException catch (e) {
      print('🔴 FirebaseAuthException during login: code=${e.code}, message=${e.message}');
      return _mapAuthError(e.code);
    } on FirebaseException catch (e) {
      print('🔴 FirebaseException during login: code=${e.code}, message=${e.message}');
      return _mapAuthError(e.code);
    } catch (e) {
      print('🔴 Unknown error during login: $e');
      return 'An unexpected error occurred. Please try again.';
    }
  }

  // ── Logout ───────────────────────────────────────────────────────────

  /// Signs out the current user.  The [authStateChanges] stream will
  /// emit `null`, causing [AuthGate] to show the logged-out UI.
  Future<void> logout() async {
    await _auth.signOut();
  }

  // ── Firestore helpers ────────────────────────────────────────────────

  /// Reads the user document from Firestore for the given [uid].
  /// Returns a `Map` with `name`, `phone`, etc., or `null` if not found.
  Future<Map<String, dynamic>?> getUserData(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    return doc.data();
  }

  // ── Error mapping ────────────────────────────────────────────────────

  /// Translates Firebase Auth error codes into user-friendly messages.
  String _mapAuthError(String code) {
    switch (code) {
      case 'email-already-in-use':
        return 'This phone number is already registered.';
      case 'invalid-email':
        return 'Invalid phone number format.';
      case 'weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'user-not-found':
        return 'No account found for this phone number.';
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'invalid-credential':
        return 'Invalid phone number or password.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Authentication error: $code';
    }
  }
}
