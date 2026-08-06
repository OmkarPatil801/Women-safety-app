import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';
import 'package:vibration/vibration.dart';

import 'fake_caller.dart';
import 'fake_conversation_screen.dart';

/// A realistic-looking incoming call screen for the Fake Call feature.
///
/// Plays the device's own system ringtone on loop and drives a repeating
/// vibration pattern for as long as this screen is visible — both are
/// stopped the moment the call is accepted, rejected, or this screen is
/// otherwise disposed, so nothing keeps ringing/buzzing in the
/// background.
class FakeIncomingCallScreen extends StatefulWidget {
  const FakeIncomingCallScreen({required this.caller});

  final FakeCaller caller;

  @override
  State<FakeIncomingCallScreen> createState() =>
      _FakeIncomingCallScreenState();
}

class _FakeIncomingCallScreenState extends State<FakeIncomingCallScreen> {
  final FlutterRingtonePlayer _ringtonePlayer = FlutterRingtonePlayer();
  bool _stopped = false;

  @override
  void initState() {
    super.initState();
    _startRingingAndVibrating();
  }

  Future<void> _startRingingAndVibrating() async {
    // Ringtone (loops on Android; plays once on iOS — a platform
    // limitation of the underlying system APIs, not this app's choice).
    unawaited(_ringtonePlayer.playRingtone(looping: true, volume: 1.0));

    // Vibration: ring 800ms, pause 800ms, repeat from index 0 — a
    // realistic "phone ringing" pattern rather than one single buzz.
    if (await Vibration.hasVibrator()) {
      unawaited(
        Vibration.vibrate(pattern: [0, 800, 800], repeat: 0),
      );
    }
  }

  void _stopRingingAndVibrating() {
    if (_stopped) return;
    _stopped = true;
    _ringtonePlayer.stop();
    Vibration.cancel();
  }

  void _reject() {
    _stopRingingAndVibrating();
    Navigator.of(context).pop();
  }

  void _accept() {
    _stopRingingAndVibrating();
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => FakeConversationScreen(caller: widget.caller),
      ),
    );
  }

  @override
  void dispose() {
    _stopRingingAndVibrating();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      // A real incoming call screen doesn't dismiss on back-press —
      // the user must explicitly accept or reject.
      canPop: false,
      child: Scaffold(
        backgroundColor: const Color(0xFF0D0D0D),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              children: [
                const SizedBox(height: 40),
                const Text(
                  'Incoming call',
                  style: TextStyle(color: Colors.grey, fontSize: 16),
                ),
                const SizedBox(height: 32),
                widget.caller.buildAvatar(radius: 70),
                const SizedBox(height: 24),
                Text(
                  widget.caller.displayName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Mobile',
                  style: TextStyle(color: Colors.grey, fontSize: 14),
                ),
                const Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _callButton(
                      icon: Icons.call_end,
                      color: const Color(0xFFE53935),
                      label: 'Decline',
                      onTap: _reject,
                    ),
                    _callButton(
                      icon: Icons.call,
                      color: const Color(0xFF43A047),
                      label: 'Accept',
                      onTap: _accept,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _callButton({
    required IconData icon,
    required Color color,
    required String label,
    required VoidCallback onTap,
  }) {
    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 68,
            height: 68,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            child: Icon(icon, color: Colors.white, size: 30),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
      ],
    );
  }
}
