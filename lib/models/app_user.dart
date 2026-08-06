import 'package:cloud_firestore/cloud_firestore.dart';

/// The unified user model for Firebase Authentication + Firestore.
///
/// Deliberately plain (no Drift annotations) so it stays independent of
/// the existing (currently unused) Drift `Users` table — that table is
/// untouched by the Firebase Auth integration. [uid] is the Firebase
/// Auth UID, and is the natural join key for future work like Report
/// ownership (`Report.userId`) or a local Drift cache of this profile.
class AppUser {
  const AppUser({
    required this.uid,
    required this.name,
    this.email,
    this.phone,
    required this.createdAt,
  });

  /// Firebase Auth UID — also the Firestore document id under `users/`.
  final String uid;

  final String name;

  /// Nullable: the current Login/Register UI only collects a phone
  /// number, not an email, so this stays null until a future screen
  /// actually collects a real one.
  final String? email;

  final String? phone;

  final DateTime createdAt;

  /// Builds an [AppUser] from a `users/{uid}` Firestore document.
  factory AppUser.fromFirestore(String uid, Map<String, dynamic> data) {
    final createdAtValue = data['createdAt'];
    return AppUser(
      uid: uid,
      name: data['name'] as String? ?? '',
      email: data['email'] as String?,
      phone: data['phone'] as String?,
      createdAt: createdAtValue is Timestamp
          ? createdAtValue.toDate()
          : DateTime.now(),
    );
  }

  /// The fields written to `users/{uid}` on signup. Never includes a
  /// password — Firebase Authentication owns credential storage
  /// entirely; Firestore only ever sees profile data.
  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
