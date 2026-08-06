import 'package:drift/drift.dart';

import '../database/app_database.dart';
import '../database/database.dart';

/// Re-exports the generated [Contact] data class so callers only ever
/// need to import this repository file — never `app_database.dart` or
/// Drift itself — to work with contacts.
export '../database/app_database.dart' show Contact;

/// Abstraction over persistence for [Contact] records.
///
/// Callers must depend on this interface, never on [DatabaseService] or
/// Drift types directly.
abstract class ContactRepository {
  /// Persists a new [Contact]. Returns the same data with its assigned
  /// id.
  Future<Contact> create(Contact contact);

  /// Looks up a contact by its local id. Returns null if not found.
  Future<Contact?> findById(int id);

  /// Returns every locally stored contact.
  Future<List<Contact>> getAll();

  /// Returns every contact marked as a Primary Emergency Contact
  /// (`isPrimary == true`). `sendSOS()` sends only to these — there is
  /// no limit on how many contacts can be primary. Filtered entirely in
  /// SQL (a `WHERE` clause), not fetched-then-filtered in Dart.
  Future<List<Contact>> getPrimaryContacts();

  /// Persists changes to an existing [Contact]. Returns the same
  /// instance once written.
  Future<Contact> update(Contact contact);

  /// Deletes the contact with the given local id. Returns true if a
  /// record was actually deleted.
  Future<bool> delete(int id);

  /// Returns contacts whose name or phone number contains [query]
  /// (case-insensitive).
  Future<List<Contact>> search(String query);
}

/// Drift-backed implementation of [ContactRepository].
///
/// Talks only to [DatabaseService] to reach the shared database.
class DriftContactRepository implements ContactRepository {
  DriftContactRepository([DatabaseService? databaseService])
      : _databaseService = databaseService ?? DatabaseService.instance;

  final DatabaseService _databaseService;

  @override
  Future<Contact> create(Contact contact) async {
    final db = _databaseService.database;
    final id = await db.into(db.contacts).insert(
          ContactsCompanion.insert(
            name: contact.name,
            phone: contact.phone,
            relationship: Value(contact.relationship),
            isPrimary: Value(contact.isPrimary),
          ),
        );
    return contact.copyWith(id: id);
  }

  @override
  Future<Contact> update(Contact contact) async {
    final db = _databaseService.database;
    await db.update(db.contacts).replace(contact);
    return contact;
  }

  @override
  Future<Contact?> findById(int id) {
    final db = _databaseService.database;
    return (db.select(db.contacts)..where((c) => c.id.equals(id)))
        .getSingleOrNull();
  }

  @override
  Future<List<Contact>> getAll() {
    final db = _databaseService.database;
    return db.select(db.contacts).get();
  }

  @override
  Future<List<Contact>> getPrimaryContacts() {
    final db = _databaseService.database;
    // Filtering happens in the WHERE clause below (SQL), not in Dart —
    // this compiles to `SELECT * FROM contacts WHERE is_primary = 1`.
    return (db.select(db.contacts)..where((c) => c.isPrimary.equals(true)))
        .get();
  }

  @override
  Future<bool> delete(int id) async {
    final db = _databaseService.database;
    final rowsDeleted =
        await (db.delete(db.contacts)..where((c) => c.id.equals(id))).go();
    return rowsDeleted > 0;
  }

  @override
  Future<List<Contact>> search(String query) {
    final db = _databaseService.database;
    final likeQuery = '%$query%';
    return (db.select(db.contacts)
          ..where((c) => c.name.like(likeQuery) | c.phone.like(likeQuery)))
        .get();
  }
}
