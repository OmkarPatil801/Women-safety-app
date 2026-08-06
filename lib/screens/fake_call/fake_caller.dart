import 'package:flutter/material.dart';

/// How long to wait after the user taps "Start Fake Call" before the
/// incoming call screen appears.
enum FakeCallDelay {
  immediate('Call immediately', Duration.zero),
  seconds10('After 10 seconds', Duration(seconds: 10)),
  seconds30('After 30 seconds', Duration(seconds: 30)),
  minute1('After 1 minute', Duration(minutes: 1));

  const FakeCallDelay(this.label, this.duration);

  final String label;
  final Duration duration;
}

/// A preset "who's calling" option. [custom] lets the user type any name.
enum FakeCallerPreset {
  mom('Mom', Icons.woman, Color(0xFFE91E63)),
  dad('Dad', Icons.man, Color(0xFF3F51B5)),
  police('Police', Icons.local_police, Color(0xFF1565C0)),
  friend('Friend', Icons.person, Color(0xFF009688)),
  boss('Boss', Icons.work, Color(0xFF6D4C41)),
  custom('Custom Name', Icons.person_outline, Color(0xFF757575));

  const FakeCallerPreset(this.label, this.icon, this.color);

  final String label;
  final IconData icon;
  final Color color;
}

/// The caller a fake call will display. Purely local, in-memory data — no
/// persistence, no repository, no relation to real contacts.
///
/// This is intentionally independent of the rest of the app: it doesn't
/// import Drift, a repository, or `AuthState`, per the requirement that
/// the Fake Call feature stays completely self-contained.
class FakeCaller {
  const FakeCaller({required this.preset, this.customName});

  final FakeCallerPreset preset;

  /// Only meaningful when [preset] is [FakeCallerPreset.custom].
  final String? customName;

  /// The name to display on the incoming-call and conversation screens.
  String get displayName {
    if (preset == FakeCallerPreset.custom) {
      final name = customName?.trim();
      return (name == null || name.isEmpty) ? 'Unknown Caller' : name;
    }
    return preset.label;
  }

  /// Default avatar shown in place of a real caller photo — no photo
  /// picking exists yet (see the TODO list on [FakeCallScreen]).
  Widget buildAvatar({double radius = 60}) {
    return CircleAvatar(
      radius: radius,
      backgroundColor: preset.color,
      child: Icon(preset.icon, color: Colors.white, size: radius),
    );
  }
}
