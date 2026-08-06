import 'dart:async';

import 'package:flutter/material.dart';

import 'fake_caller.dart';
import 'fake_incoming_call_screen.dart';

/// Setup screen for the Fake Call feature: pick a delay and a caller,
/// then start the fake call.
///
/// Deliberately independent of the rest of the app — no Drift, no
/// repository, no `AuthState`, no network. Everything here is local
/// widget state; "no backend required" per the feature's requirements.
///
/// ── FUTURE IMPROVEMENTS (not implemented here) ──────────────────────
/// TODO(fake-call): Custom voice recording — let the user record a short
///   clip to "hear" during the fake call instead of a silent screen.
/// TODO(fake-call): Schedule fake calls — let the user set a call for a
///   specific future time (today's delay picker only supports relative
///   offsets while this screen stays open, not background scheduling).
/// TODO(fake-call): Screen-off support — trigger the incoming call even
///   if the phone's screen is off or the app is backgrounded (would need
///   a foreground service / local notification, deliberately out of
///   scope for this "no backend required" pass).
/// TODO(fake-call): Custom caller photos — let the user pick a real
///   photo instead of the default avatar (see [FakeCaller.buildAvatar]).
/// ─────────────────────────────────────────────────────────────────────
class FakeCallScreen extends StatefulWidget {
  const FakeCallScreen({super.key});

  @override
  State<FakeCallScreen> createState() => _FakeCallScreenState();
}

class _FakeCallScreenState extends State<FakeCallScreen> {
  static const _primaryColor = Color(0xFFC0392B);
  static const _backgroundColor = Color(0xFF1A0A0A);
  static const _cardColor = Color(0xFF2B1010);

  FakeCallDelay _selectedDelay = FakeCallDelay.immediate;
  FakeCallerPreset _selectedPreset = FakeCallerPreset.mom;
  final TextEditingController _customNameController = TextEditingController();

  Timer? _countdownTimer;
  int? _secondsRemaining;

  bool get _isCounting => _secondsRemaining != null;

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _customNameController.dispose();
    super.dispose();
  }

  FakeCaller get _caller => FakeCaller(
        preset: _selectedPreset,
        customName: _customNameController.text,
      );

  void _startFakeCall() {
    final delay = _selectedDelay.duration;

    if (delay == Duration.zero) {
      _launchIncomingCallScreen();
      return;
    }

    setState(() => _secondsRemaining = delay.inSeconds);
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final remaining = (_secondsRemaining ?? 1) - 1;
      if (remaining <= 0) {
        timer.cancel();
        setState(() => _secondsRemaining = null);
        _launchIncomingCallScreen();
      } else {
        setState(() => _secondsRemaining = remaining);
      }
    });
  }

  void _cancelCountdown() {
    _countdownTimer?.cancel();
    setState(() => _secondsRemaining = null);
  }

  void _launchIncomingCallScreen() {
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => FakeIncomingCallScreen(caller: _caller),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _backgroundColor,
      appBar: AppBar(
        backgroundColor: _backgroundColor,
        elevation: 0,
        leading: const BackButton(color: Colors.white),
        title: const Text(
          'Fake Call',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.phone_in_talk, color: Colors.grey[600], size: 48),
            const SizedBox(height: 12),
            const Text(
              'Simulate an incoming call to help you exit an uncomfortable situation.',
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 28),
            _sectionLabel('WHEN'),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: FakeCallDelay.values
                  .map((delay) => _delayChip(delay))
                  .toList(),
            ),
            const SizedBox(height: 28),
            _sectionLabel('WHO\'S CALLING'),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: FakeCallerPreset.values
                  .map((preset) => _callerChip(preset))
                  .toList(),
            ),
            if (_selectedPreset == FakeCallerPreset.custom) ...[
              const SizedBox(height: 12),
              _customNameField(),
            ],
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isCounting ? _cancelCountdown : _startFakeCall,
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      _isCounting ? Colors.grey[800] : _primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(
                  _isCounting
                      ? 'Cancel — calling in ${_secondsRemaining}s'
                      : 'Start Fake Call',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
          color: Colors.grey, fontSize: 11, letterSpacing: 1.5),
    );
  }

  Widget _delayChip(FakeCallDelay delay) {
    final selected = delay == _selectedDelay;
    return ChoiceChip(
      label: Text(delay.label),
      selected: selected,
      onSelected: _isCounting
          ? null
          : (_) => setState(() => _selectedDelay = delay),
      selectedColor: _primaryColor,
      backgroundColor: _cardColor,
      labelStyle: TextStyle(
        color: selected ? Colors.white : Colors.grey[400],
        fontSize: 13,
      ),
      side: BorderSide(color: _primaryColor.withOpacity(0.3)),
    );
  }

  Widget _callerChip(FakeCallerPreset preset) {
    final selected = preset == _selectedPreset;
    return ChoiceChip(
      avatar: Icon(preset.icon,
          size: 18, color: selected ? Colors.white : preset.color),
      label: Text(preset.label),
      selected: selected,
      onSelected: _isCounting
          ? null
          : (_) => setState(() => _selectedPreset = preset),
      selectedColor: _primaryColor,
      backgroundColor: _cardColor,
      labelStyle: TextStyle(
        color: selected ? Colors.white : Colors.grey[400],
        fontSize: 13,
      ),
      side: BorderSide(color: _primaryColor.withOpacity(0.3)),
    );
  }

  Widget _customNameField() {
    return TextField(
      controller: _customNameController,
      enabled: !_isCounting,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: 'Enter caller name',
        hintStyle: TextStyle(color: Colors.grey[600], fontSize: 13),
        filled: true,
        fillColor: Colors.white.withOpacity(0.04),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: _primaryColor.withOpacity(0.2)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: _primaryColor.withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: _primaryColor.withOpacity(0.6)),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }
}
