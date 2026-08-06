import 'dart:async';

import 'package:flutter/material.dart';

import 'fake_caller.dart';

/// Shown once a fake call is "accepted". Starts on "Connected..." and
/// then shows a live elapsed-time counter, like a real in-call screen —
/// there is no actual audio/video call happening, this is purely visual.
class FakeConversationScreen extends StatefulWidget {
  const FakeConversationScreen({required this.caller});

  final FakeCaller caller;

  @override
  State<FakeConversationScreen> createState() =>
      _FakeConversationScreenState();
}

class _FakeConversationScreenState extends State<FakeConversationScreen> {
  static const _connectingDuration = Duration(seconds: 2);

  bool _connected = false;
  Duration _elapsed = Duration.zero;
  Timer? _elapsedTimer;
  Timer? _connectingTimer;

  @override
  void initState() {
    super.initState();
    _connectingTimer = Timer(_connectingDuration, _onConnected);
  }

  void _onConnected() {
    if (!mounted) return;
    setState(() => _connected = true);
    _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _elapsed += const Duration(seconds: 1));
    });
  }

  void _endCall() {
    // Return all the way back to the home screen, like hanging up ends
    // the whole fake-call flow rather than leaving the setup screen on
    // the stack underneath.
    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  String _formatElapsed() {
    final minutes = _elapsed.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = _elapsed.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _connectingTimer?.cancel();
    _elapsedTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _endCall();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0D0D0D),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              children: [
                const SizedBox(height: 48),
                widget.caller.buildAvatar(radius: 60),
                const SizedBox(height: 24),
                Text(
                  widget.caller.displayName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  _connected ? _formatElapsed() : 'Connected...',
                  style: TextStyle(
                    color: _connected ? Colors.greenAccent : Colors.grey,
                    fontSize: 16,
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: _endCall,
                  child: Container(
                    width: 68,
                    height: 68,
                    decoration: const BoxDecoration(
                      color: Color(0xFFE53935),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.call_end,
                        color: Colors.white, size: 30),
                  ),
                ),
                const SizedBox(height: 8),
                const Text('End Call',
                    style: TextStyle(color: Colors.grey, fontSize: 13)),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
