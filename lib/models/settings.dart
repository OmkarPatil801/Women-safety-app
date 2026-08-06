import 'package:drift/drift.dart';

/// The `settings_table` table — local app preferences.
///
/// Named `SettingsTable` (rather than bare `Settings`) purely to avoid
/// the generic word `Settings` doubling as both the Drift table class
/// and, via [DataClassName], the generated row class — [DataClassName]
/// below pins the generated data class to `Settings` regardless.
@DataClassName('Settings')
class SettingsTable extends Table {
  /// Local auto-incrementing primary key.
  IntColumn get id => integer().autoIncrement()();

  /// Whether dark mode is enabled. Defaults to true, matching the app's
  /// current always-dark theme — no light theme exists yet, so this
  /// default doesn't change any current visual behavior once read.
  BoolColumn get darkMode => boolean().withDefault(const Constant(true))();

  /// Whether notifications are enabled.
  BoolColumn get notifications =>
      boolean().withDefault(const Constant(true))();

  /// The user's preferred language code.
  TextColumn get language => text().withDefault(const Constant('en'))();
}
