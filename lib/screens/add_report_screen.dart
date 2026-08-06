import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/report_model.dart';
import '../services/firestore_service.dart';

class AddReportScreen extends StatefulWidget {
  const AddReportScreen({super.key});

  @override
  State<AddReportScreen> createState() => _AddReportScreenState();
}

class _AddReportScreenState extends State<AddReportScreen> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController idController = TextEditingController();
  final TextEditingController descriptionController =
      TextEditingController();
  final TextEditingController otherCategoryController =
    TextEditingController();
  final FirestoreService firestoreService = FirestoreService();

  String category = "Harassment";
  String severity = "Low";
  double latitude = 0.0;
  double longitude = 0.0;

  Future<void> getCurrentLocation() async {
    LocationPermission permission = await Geolocator.requestPermission();

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      return;
    }

    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    setState(() {
      latitude = position.latitude;
      longitude = position.longitude;
    });
  }

  @override
  void initState() {
    super.initState();
    getCurrentLocation();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Incident Report"),
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),

        child: Column(
          children: [

            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: "Name",
              ),
            ),

            const SizedBox(height: 15),

            TextField(
              controller: descriptionController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: "Description",
              ),
            ),

            const SizedBox(height: 15),

            TextFormField(
              controller: TextEditingController(
                text: latitude.toStringAsFixed(6),
              ),
              readOnly: true,
              decoration: const InputDecoration(
                labelText: "Latitude",
              ),
            ),

            const SizedBox(height: 15),

            TextFormField(
              controller: TextEditingController(
                text: longitude.toStringAsFixed(6),
              ),
              readOnly: true,
              decoration: const InputDecoration(
                labelText: "Longitude",
              ),
            ),

            const SizedBox(height: 20),

            DropdownButtonFormField<String>(
              value: category,
              decoration: const InputDecoration(
                labelText: "Category",
              ),
              items: const [
                DropdownMenuItem(
                    value: "Harassment",
                    child: Text("Harassment")),
                DropdownMenuItem(
                    value: "Stalking",
                    child: Text("Stalking")),
                DropdownMenuItem(
                    value: "Poor Lighting",
                    child: Text("Poor Lighting")),
                DropdownMenuItem(
                    value: "Unsafe Road",
                    child: Text("Unsafe Road")),
                DropdownMenuItem(
                    value: "Other",
                    child: Text("Other")),
              ],
              onChanged: (value) {
                setState(() {
                  category = value!;
                });
              },
            ),

            const SizedBox(height: 20),

            if (category == "Other") ...[
              TextField(
                controller: otherCategoryController,
                decoration: const InputDecoration(
                  labelText: "Please specify the category",
                  hintText: "Enter incident category",
                ),
              ),
              const SizedBox(height: 20),
            ],

            DropdownButtonFormField<String>(
              value: severity,
              decoration: const InputDecoration(
                labelText: "Severity",
              ),
              items: const [
                DropdownMenuItem(value: "Low", child: Text("Low")),
                DropdownMenuItem(value: "Medium", child: Text("Medium")),
                DropdownMenuItem(value: "High", child: Text("High")),
                DropdownMenuItem(value: "Critical", child: Text("Critical")),
              ],
              onChanged: (value) {
                setState(() {
                  severity = value!;
                });
              },
            ),

            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {

                  if (nameController.text.trim().isEmpty ||
                      descriptionController.text.trim().isEmpty) {
                    
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Please fill all required fields"),
                      ),
                    );
                    return;
                  }
                
                  String reportId =
                      "RPT-${DateTime.now().millisecondsSinceEpoch}";
                
                  ReportModel report = ReportModel(
                    id: reportId,
                    name: nameController.text.trim(),
                    latitude: latitude,
                    longitude: longitude,
                    description: descriptionController.text.trim(),
                    category: category == "Other"
                        ? otherCategoryController.text.trim()
                        : category,
                    severity: severity,
                    imagePath: "",
                    synced: false,
                    timestamp: Timestamp.now(),
                  );
                
                  try {
                
                    await firestoreService.saveReport(report);
                
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Report Submitted Successfully"),
                      ),
                    );
                
                    Navigator.pop(context);
                
                  } catch (e) {
                
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("Error: $e"),
                      ),
                    );
                
                  }
                
                },
                child: const Text("Submit"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}