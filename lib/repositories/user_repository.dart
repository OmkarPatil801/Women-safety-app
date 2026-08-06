import 'package:drift/drift.dart';

import '../database/app_database.dart';
import '../database/database.dart';

/// Re-exports the generated [User] data class so callers only ever need
/// to import this repository file — never `app_database.dart` or Drift
/// itself — to work with users.
export '../database/app_database.dart' show User;

/// Abstraction over persistence for [User] records.
///
/// Callers must depend on this interface, never on [DatabaseService] or
/// Drift types directly — this is what lets a future cloud-backed
/// implementation (e.g. syncing through Firebase Auth) be substituted
/// later without any calling code changing.
abstract class UserRepository {
  /// Persists a new [User]. Returns the same data with its assigned id.
  Future<User> create(User user);

  /// Looks up a user by their local id. Returns null if not found.
  Future<User?> findById(int id);

  /// Returns every locally stored user.
  Future<List<User>> getAll();

  /// Persists changes to an existing [User]. Returns the same instance
  /// once written.
  Future<User> update(User user);

  /// Deletes the user with the given local id. Returns true if a record
  /// was actually deleted.
  Future<bool> delete(int id);

  /// Returns users whose name or phone number contains [query]
  /// (case-insensitive).
  Future<List<User>> search(String query);
}

/// Drift-backed implementation of [UserRepository].
///
/// Talks only to [DatabaseService] to reach the shared database — it
/// never opens its own connection, and no public method here accepts or
/// returns a Drift type.
class DriftUserRepository implements UserRepository {
  DriftUserRepository([DatabaseService? databaseService])
      : _databaseService = databaseService ?? DatabaseService.instance;

  final DatabaseService _databaseService;

  @override
  Future<User> create(User user) async {
    final db = _databaseService.database;
    final id = await db.into(db.users).insert(
          UsersCompanion.insert(
            name: user.name,
            phone: user.phone,
            email: Value(user.email),
          ),
        );
    return user.copyWith(id: id);
  }

  @override
  Future<User> update(User user) async {
    final db = _databaseService.database;
    await db.update(db.users).replace(user);
    return user;
  }

  @override
  Future<User?> findById(int id) {
    final db = _databaseService.database;
    return (db.select(db.users)..where((u) => u.id.equals(id)))
        .getSingleOrNull();
  }

  @override
  Future<List<User>> getAll() {
    final db = _databaseService.database;
    return db.select(db.users).get();
  }

  @override
  Future<bool> delete(int id) async {
    final db = _databaseService.database;
    final rowsDeleted =
        await (db.delete(db.users)..where((u) => u.id.equals(id))).go();
    return rowsDeleted > 0;
  }

  @override
  Future<List<User>> search(String query) {
    final db = _databaseService.database;
    final likeQuery = '%$query%';
    return (db.select(db.users)
          ..where((u) => u.name.like(likeQuery) | u.phone.like(likeQuery)))
        .get();
  }
}
