import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'database/database.dart';
import 'models/app_user.dart';
import 'repositories/contact_repository.dart';
import 'screens/emergency_contacts_screen.dart';
import 'screens/fake_call/fake_call_screen.dart';
import 'screens/map_screen.dart';
import 'screens/report_screen.dart';
import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // TODO: Enable after Firebase is configured
  // await Firebase.initializeApp();
  // await AuthState.restoreSession();

  await DatabaseService.instance.openDatabase();

  runApp(SafetyApp());
}

// ─── Auth state — backed by Firebase Authentication + Firestore ────────────
//
// Public shape (loggedInUser, loggedInName, login, register, logout) is
// unchanged from the original in-memory version, so every existing call
// site (LoginScreen, HomeScreen, _AuthCard) works without modification.
// The actual Firebase Auth/Firestore calls live in AuthService — this
// class is a thin, backwards-compatible wrapper around it.
class AuthState {
  static final AuthService _authService = AuthService();
  static AppUser? _currentUser;

  /// Preserved for compatibility with existing call sites — was the map
  /// key (phone number) under the old in-memory implementation, and
  /// remains the signed-in user's phone number now. Every existing call
  /// site only null-checks this value, never reads its content.
  static String? get loggedInUser => _currentUser?.phone;

  static String? get loggedInName => _currentUser?.name;

  /// The full Firebase-backed profile, for any future code that needs
  /// more than just the phone/name (e.g. `uid` for Report ownership).
  static AppUser? get currentUser => _currentUser;

  static Future<bool> login(String phone, String password) async {
    final user = await _authService.login(phone, password);
    _currentUser = user;
    return user != null;
  }

  static Future<bool> register(String name, String phone, String password) async {
    final user = await _authService.register(name, phone, password);
    _currentUser = user;
    return user != null;
  }

  static Future<void> logout() async {
    await _authService.logout();
    _currentUser = null;
  }

  /// Called once at app startup so a previously signed-in user is still
  /// shown as logged in after a restart — Firebase Auth persists the
  /// session natively; this just re-loads the matching Firestore profile.
  static Future<void> restoreSession() async {
    _currentUser = await _authService.restoreSession();
  }
}

// ─── App Root ─────────────────────────────────────────────────────────────────
class SafetyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Women Safety App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF1A0A0A),
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFFC0392B),
          secondary: const Color(0xFFF1948A),
        ),
      ),
      home: HomeScreen(),
    );
  }
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
class HomeScreen extends StatefulWidget {
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ContactRepository _contactRepository = DriftContactRepository();

  // ════════════════════════════════════════════════════════
  // 🔥 SOS FUNCTION — sends only to contacts marked as Primary
  // Emergency Contacts, read from ContactRepository (Drift).
  // ════════════════════════════════════════════════════════
  Future<void> sendSOS() async {
    try {
      // 1. Check permission
      LocationPermission permission = await Geolocator.checkPermission();

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        print("Location permission permanently denied");
        return;
      }

      // 2. Get current location
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      double lat = position.latitude;
      double lng = position.longitude;

      // 3. Load Primary Emergency Contacts from the local database
      final contacts = await _contactRepository.getPrimaryContacts();

      if (contacts.isEmpty) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                'No Primary Emergency Contacts selected. Please mark at least one contact as Primary.'),
            backgroundColor: const Color(0xFFC0392B),
          ),
        );
        return;
      }

      // 4. Create SOS message
      String message =
          "🚨 SOS! I need help.\nMy Location: https://maps.google.com/?q=$lat,$lng";

      // 5. Address the message to every Primary Emergency Contact at once
      final recipients = contacts.map((c) => c.phone).join(',');
      final Uri smsUri = Uri(
        scheme: 'sms',
        path: recipients,
        queryParameters: {'body': message},
      );

      // 6. Open SMS app
      await launchUrl(smsUri);

    } catch (e) {
      print("Error sending SOS: $e");
    }
  }
  // ════════════════════════════════════════════════════════

  void _goToLogin() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => LoginScreen()),
    );
    setState(() {}); // refresh UI after login/register
  }
  
  void _logout() async {
    await AuthState.logout();
    if (!mounted) return;
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Signed out successfully'),
        backgroundColor: Colors.grey[800],
      ),
    );
  }

  void _onLockedFeatureTap(String featureName) {
    if (AuthState.loggedInUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Login to use $featureName'),
          backgroundColor: const Color(0xFFC0392B),
          action: SnackBarAction(
            label: 'Login',
            textColor: Colors.white,
            onPressed: _goToLogin,
          ),
        ),
      );
    } else {
      // TODO: add navigation to each feature screen later
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$featureName — coming soon!'),
          backgroundColor: Colors.grey[800],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isLoggedIn = AuthState.loggedInUser != null;

    return Scaffold(
      backgroundColor: const Color(0xFF1A0A0A),
      appBar: AppBar(
        title: Text(
          "Women Safety",
          style: TextStyle(
              color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        backgroundColor: const Color(0xFF1A0A0A),
        elevation: 0,
        actions: [
          if (isLoggedIn)
            TextButton.icon(
              onPressed: _logout,
              icon: Icon(Icons.logout, color: Colors.grey, size: 18),
              label: Text(
                AuthState.loggedInName ?? 'User',
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
            )
          else
            TextButton(
              onPressed: _goToLogin,
              child: Text(
                'Login',
                style: TextStyle(
                    color: const Color(0xFFF1948A),
                    fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            const SizedBox(height: 10),

            // ── Shield icon + status ─────────────────────────
            Icon(Icons.shield, color: Colors.green, size: 80),
            const SizedBox(height: 20),
            Text(
              "You are Safe",
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 40),

            // ════════════════════════════════════════════════
            // 🔥 ORIGINAL SOS BUTTON — COMPLETELY UNCHANGED
            // Tap → SOS alert | Long press → Map screen
            // ════════════════════════════════════════════════
            GestureDetector(
              onTap: () async {
                await sendSOS();
              },
              onLongPress: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => MapScreen()),
                );
              },
              child: Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.red.withOpacity(0.4),
                      blurRadius: 30,
                      spreadRadius: 6,
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    "SOS",
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
            // ════════════════════════════════════════════════

            const SizedBox(height: 30),

            // ── SOS Instructions Card ────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF2B1010),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: const Color(0xFFC0392B).withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.info_outline,
                          color: const Color(0xFFF1948A), size: 16),
                      const SizedBox(width: 8),
                      Text(
                        "HOW TO USE SOS",
                        style: TextStyle(
                          color: const Color(0xFFF1948A),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _instructionStep(
                    "1",
                    "Tap the SOS button",
                    "Opens your SMS app with your live GPS location pre-filled.",
                  ),
                  _instructionStep(
                    "2",
                    "Send the message",
                    "Hit send — your emergency contact receives your location instantly.",
                  ),
                  _instructionStep(
                    "3",
                    "Long press SOS → Safety Map",
                    "Hold the button to open the map and see your surroundings.",
                  ),
                  _instructionStep(
                    "4",
                    "No login needed for SOS",
                    "SOS works anytime, even without signing in — always available.",
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.amber.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: Colors.amber.withOpacity(0.25)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.bolt, color: Colors.amber, size: 14),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            "SOS is always active — no sign-in required in emergencies.",
                            style:
                                TextStyle(color: Colors.amber, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ── Divider ──────────────────────────────────────
            Row(
              children: [
                Expanded(
                    child: Divider(
                        color: const Color(0xFFC0392B).withOpacity(0.2))),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    isLoggedIn ? "WELCOME BACK" : "YOUR ACCOUNT",
                    style: TextStyle(
                        color: Colors.grey, fontSize: 10, letterSpacing: 2),
                  ),
                ),
                Expanded(
                    child: Divider(
                        color: const Color(0xFFC0392B).withOpacity(0.2))),
              ],
            ),

            const SizedBox(height: 16),

            // ── Auth / User section ──────────────────────────
            if (!isLoggedIn)
              _AuthCard(onAuthSuccess: () => setState(() {}))
            else
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                      color: Colors.green.withOpacity(0.25)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: const Color(0xFFC0392B),
                      child: Text(
                        (AuthState.loggedInName ?? 'U')[0].toUpperCase(),
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AuthState.loggedInName ?? 'User',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15),
                          ),
                          Text("✓ Logged in · Protected",
                              style: TextStyle(
                                  color: Colors.green, fontSize: 12)),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: _logout,
                      child: Text("Sign out",
                          style:
                              TextStyle(color: Colors.grey, fontSize: 12)),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 28),

            // ── Features Section ─────────────────────────────
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                isLoggedIn
                    ? "FEATURES  ·  TAP TO EXPLORE"
                    : "MORE FEATURES  ·  LOGIN TO UNLOCK",
                style: TextStyle(
                    color: Colors.grey, fontSize: 10, letterSpacing: 2),
              ),
            ),
            const SizedBox(height: 12),

            _featureTile(
              icon: Icons.location_on,
              label: "Live Location Tracking",
              desc: "Share real-time location with guardians",
              isLoggedIn: isLoggedIn,
              onTap: () => _onLockedFeatureTap("Live Location Tracking"),
            ),
            _featureTile(
              icon: Icons.contacts,
              label: "Emergency Contacts",
              desc: "Add & manage your trusted contacts",
              isLoggedIn: isLoggedIn,
              // TODO(dev-mode): login check temporarily removed so
              // ContactRepository/Drift can be tested without signing in.
              // Restore the `if (isLoggedIn) { ... } else { _onLockedFeatureTap(...) }`
              // gating (matching the other locked tiles) before production.
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => EmergencyContactsScreen(),
                  ),
                );
              },
            ),
            // TODO(dev-mode):
            // Restore authentication gate after Firebase Authentication is
            // fully configured.
            _featureTile(
              icon: Icons.map,
              label: "Safety Map",
              desc: "View risk zones and safe routes",
              isLoggedIn: isLoggedIn,
              onTap: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => MapScreen()));
              },
            ),
            // TODO(dev-mode):
            // Restore authentication gate after Firebase Authentication is
            // fully configured.
            _featureTile(
              icon: Icons.phone_in_talk,
              label: "Fake Call",
              desc: "Simulate an incoming call to escape danger",
              isLoggedIn: isLoggedIn,
              onTap: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => FakeCallScreen()));
              },
            ),
            // TODO(dev-mode):
            // Restore authentication gate after Firebase Authentication is
            // fully configured.
            _featureTile(
              icon: Icons.report,
              label: "📝 Incident Reports",
              desc: "Report incidents & view previous reports",
              isLoggedIn: isLoggedIn,
              onTap: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => ReportsScreen()));
              },
            ),

            const SizedBox(height: 36),
          ],
        ),
      ),
    );
  }

  // ── Instruction step helper ──
  Widget _instructionStep(String num, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: const Color(0xFFC0392B).withOpacity(0.18),
              shape: BoxShape.circle,
              border: Border.all(
                  color: const Color(0xFFC0392B).withOpacity(0.4)),
            ),
            child: Center(
              child: Text(num,
                  style: TextStyle(
                      color: const Color(0xFFF1948A),
                      fontSize: 11,
                      fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
                Text(desc,
                    style:
                        TextStyle(color: Colors.grey[400], fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Feature tile helper ──
  Widget _featureTile({
    required IconData icon,
    required String label,
    required String desc,
    required bool isLoggedIn,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF2B1010),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: const Color(0xFFC0392B).withOpacity(0.18)),
        ),
        child: Row(
          children: [
            Icon(icon,
                color: isLoggedIn
                    ? const Color(0xFFF1948A)
                    : Colors.grey[700],
                size: 28),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: TextStyle(
                          color:
                              isLoggedIn ? Colors.white : Colors.white38,
                          fontWeight: FontWeight.bold,
                          fontSize: 14)),
                  Text(desc,
                      style: TextStyle(
                          color: isLoggedIn
                              ? Colors.grey[400]
                              : Colors.grey[700],
                          fontSize: 12)),
                ],
              ),
            ),
            Icon(
              isLoggedIn ? Icons.chevron_right : Icons.lock,
              color: isLoggedIn ? Colors.grey : Colors.grey[700],
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _showLogin = true;

  // Login
  final _loginPhone = TextEditingController();
  final _loginPass = TextEditingController();

  // Register
  final _regName = TextEditingController();
  final _regPhone = TextEditingController();
  final _regPass = TextEditingController();

  String? _errorMsg;

  void _doLogin() async {
    final phone = _loginPhone.text.trim();
    final pass = _loginPass.text.trim();
    if (phone.isEmpty || pass.isEmpty) {
      setState(() => _errorMsg = 'Please fill in all fields.');
      return;
    }
    final success = await AuthState.login(phone, pass);
    if (!mounted) return;
    if (success) {
      Navigator.pop(context);
    } else {
      setState(() => _errorMsg = 'Invalid phone or password.');
    }
  }

  void _doRegister() async {
    final name = _regName.text.trim();
    final phone = _regPhone.text.trim();
    final pass = _regPass.text.trim();
    if (name.isEmpty || phone.isEmpty || pass.isEmpty) {
      setState(() => _errorMsg = 'Please fill in all fields.');
      return;
    }
    if (pass.length < 6) {
      setState(
          () => _errorMsg = 'Password must be at least 6 characters.');
      return;
    }
    final success = await AuthState.register(name, phone, pass);
    if (!mounted) return;
    if (success) {
      Navigator.pop(context);
    } else {
      setState(() => _errorMsg = 'Registration failed — phone number may already be registered.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A0A0A),
        elevation: 0,
        leading: BackButton(color: Colors.white),
        title: Text(
          _showLogin ? "Sign In" : "Create Account",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 10),
            Icon(Icons.shield, color: const Color(0xFFC0392B), size: 60),
            const SizedBox(height: 12),
            Text(
              _showLogin ? "Welcome Back" : "Join SafeHer",
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold),
            ),
            Text(
              _showLogin
                  ? "Sign in to unlock all safety features"
                  : "Create your account to stay protected",
              style: TextStyle(color: Colors.grey, fontSize: 13),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 30),

            // Tabs
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF2B1010),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                    color: const Color(0xFFC0392B).withOpacity(0.25)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      _tab("Sign In", _showLogin,
                          () => setState(() {
                                _showLogin = true;
                                _errorMsg = null;
                              })),
                      _tab("Register", !_showLogin,
                          () => setState(() {
                                _showLogin = false;
                                _errorMsg = null;
                              })),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        if (_showLogin) ...[
                          _field(_loginPhone, "Phone / Email",
                              TextInputType.phone),
                          const SizedBox(height: 12),
                          _field(_loginPass, "Password",
                              TextInputType.text,
                              obscure: true),
                        ] else ...[
                          _field(_regName, "Full Name",
                              TextInputType.name),
                          const SizedBox(height: 12),
                          _field(_regPhone, "Phone Number",
                              TextInputType.phone),
                          const SizedBox(height: 12),
                          _field(_regPass, "Password (min 6 chars)",
                              TextInputType.text,
                              obscure: true),
                        ],
                        if (_errorMsg != null) ...[
                          const SizedBox(height: 10),
                          Text(_errorMsg!,
                              style: TextStyle(
                                  color: const Color(0xFFF1948A),
                                  fontSize: 12)),
                        ],
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed:
                                _showLogin ? _doLogin : _doRegister,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFC0392B),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                  vertical: 14),
                              shape: RoundedRectangleBorder(
                                  borderRadius:
                                      BorderRadius.circular(10)),
                            ),
                            child: Text(
                              _showLogin
                                  ? "Sign In →"
                                  : "Create Account →",
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        GestureDetector(
                          onTap: () => setState(() {
                            _showLogin = !_showLogin;
                            _errorMsg = null;
                          }),
                          child: Text(
                            _showLogin
                                ? "New here? Create an account"
                                : "Already registered? Sign in",
                            style: TextStyle(
                                color: const Color(0xFFF1948A),
                                fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // SOS reminder
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.07),
                borderRadius: BorderRadius.circular(12),
                border:
                    Border.all(color: Colors.amber.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Icon(Icons.bolt, color: Colors.amber, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      "SOS is always available on the home screen — no login required.",
                      style:
                          TextStyle(color: Colors.amber, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tab(String label, bool active, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: active
                    ? const Color(0xFFC0392B)
                    : Colors.transparent,
                width: 2,
              ),
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: active ? Colors.white : Colors.grey,
              fontWeight:
                  active ? FontWeight.bold : FontWeight.normal,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController controller,
    String hint,
    TextInputType type, {
    bool obscure = false,
  }) {
    return TextField(
      controller: controller,
      keyboardType: type,
      obscureText: obscure,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey[600], fontSize: 13),
        filled: true,
        fillColor: Colors.white.withOpacity(0.04),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
              color: const Color(0xFFC0392B).withOpacity(0.2)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
              color: const Color(0xFFC0392B).withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
              color: const Color(0xFFC0392B).withOpacity(0.6)),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }
}

// ─── Placeholder for _AuthCard used inline in HomeScreen ─────────────────────
class _AuthCard extends StatelessWidget {
  final VoidCallback onAuthSuccess;
  const _AuthCard({required this.onAuthSuccess});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => LoginScreen()),
        );
        onAuthSuccess();
      },
      icon: Icon(Icons.login),
      label: Text("Sign In / Register"),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFFC0392B),
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
