import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'map_screen.dart';

void main() {
  runApp(SafetyApp());
}

class SafetyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Women Safety App',
      debugShowCheckedModeBanner: false,
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {

  // 🔥 SOS FUNCTION
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

      // 3. Create SOS message
      String message =
          "🚨 SOS! I need help.\nMy Location: https://maps.google.com/?q=$lat,$lng";

      // 👉 Replace with your phone number
      final Uri smsUri = Uri(
        scheme: 'sms',
        path: '7755922469',
        queryParameters: {'body': message},
      );

      // 4. Open SMS app
      await launchUrl(smsUri);

    } catch (e) {
      print("Error sending SOS: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text("Women Safety"),
        backgroundColor: Colors.black,
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shield, color: Colors.green, size: 80),

          SizedBox(height: 20),

          Text(
            "You are Safe",
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),

          SizedBox(height: 40),

          Center(
            child: GestureDetector(
              // 🔥 TAP → SOS
              onTap: () async {
                await sendSOS();
              },

              // 🔥 LONG PRESS → MAP (optional cool feature)
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
                ),
                child: Center(
                  child: Text(
                    "SOS",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}