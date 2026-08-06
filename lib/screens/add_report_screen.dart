import 'dart:io';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import '../main.dart' show AuthState;
import '../repositories/report_repository.dart';

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
final ReportRepository reportRepository = DriftReportRepository();
  final ImagePicker _imagePicker = ImagePicker();

  String category = "Harassment";
  String severity = "Low";
  double latitude = 0.0;
  double longitude = 0.0;
  File? selectedImage;
  bool reportAnonymously = false;
  bool isRefreshingLocation = false;

  /// The name attached to the report is not simply the raw text field
  /// anymore — it depends on anonymity + whether a signed-in Firebase
  /// display name is available. See requirements: anonymous always wins;
  /// otherwise prefer the authenticated name; the manual field is only a
  /// fallback while Firebase Authentication isn't configured yet.
  String _resolveReporterName() {
    if (reportAnonymously) return "Anonymous";

    final loggedInName = AuthState.loggedInName;
    if (loggedInName != null && loggedInName.trim().isNotEmpty) {
      return loggedInName.trim();
    }

    return nameController.text.trim();
  }

  /// True while the manual Name field must still be shown/required —
  /// i.e. not anonymous, and no authenticated display name to fall back
  /// to (Firebase not configured yet, or Firebase configured but user is
  /// somehow not signed in when reaching this screen).
  bool get _needsManualName =>
      !reportAnonymously &&
      (AuthState.loggedInName == null ||
          AuthState.loggedInName!.trim().isEmpty);

  Future<void> _pickImage(ImageSource source) async {
    final XFile? picked = await _imagePicker.pickImage(source: source);
    if (picked == null) return;

    setState(() {
      selectedImage = File(picked.path);
    });
  }

  void _showImageSourceSheet() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return SafeArea(
          child: Wrap(
            children: [
              ListTile(
                leading: const Icon(Icons.photo_camera),
                title: const Text("Camera"),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text("Gallery"),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> getCurrentLocation() async {
    setState(() {
      isRefreshingLocation = true;
    });

    try {
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
    } finally {
      if (mounted) {
        setState(() {
          isRefreshingLocation = false;
        });
      }
    }
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

            CheckboxListTile(
              value: reportAnonymously,
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              title: const Text("Report Anonymously"),
              onChanged: (value) {
                setState(() {
                  reportAnonymously = value ?? false;
                });
              },
            ),

            if (_needsManualName) ...[
              const SizedBox(height: 10),
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: "Name",
                ),
              ),
            ] else if (!reportAnonymously) ...[
              const SizedBox(height: 10),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Reporting as: ${AuthState.loggedInName}",
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            ],

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

            const SizedBox(height: 10),

            Align(
              alignment: Alignment.centerLeft,
              child: OutlinedButton.icon(
                onPressed: isRefreshingLocation ? null : getCurrentLocation,
                icon: isRefreshingLocation
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.location_searching),
                label: Text(
                  isRefreshingLocation
                      ? "Refreshing..."
                      : "📍 Refresh Location",
                ),
              ),
            ),

            const SizedBox(height: 20),

            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Category",
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),

            const SizedBox(height: 10),

            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                "Harassment",
                "Stalking",
                "Poor Lighting",
                "Unsafe Road",
                "Other",
              ].map((option) {
                return ChoiceChip(
                  label: Text(option),
                  selected: category == option,
                  onSelected: (_) {
                    setState(() {
                      category = option;
                    });
                  },
                );
              }).toList(),
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

            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Severity",
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),

            const SizedBox(height: 10),

            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ("Low", "🟢", Colors.green),
                ("Medium", "🟠", Colors.orange),
                ("High", "🔴", Colors.red),
                ("Critical", "⚫", Colors.black),
              ].map((option) {
                final (label, emoji, color) = option;
                final bool isSelected = severity == label;

                return ChoiceChip(
                  label: Text("$emoji $label"),
                  selected: isSelected,
                  selectedColor: color.withOpacity(0.25),
                  side: BorderSide(
                    color: isSelected ? color : Colors.grey.shade400,
                  ),
                  onSelected: (_) {
                    setState(() {
                      severity = label;
                    });
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Photo (optional)",
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),

            const SizedBox(height: 10),

            if (selectedImage != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.file(
                  selectedImage!,
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  TextButton.icon(
                    onPressed: _showImageSourceSheet,
                    icon: const Icon(Icons.swap_horiz),
                    label: const Text("Change Photo"),
                  ),
                  TextButton.icon(
                    onPressed: () {
                      setState(() {
                        selectedImage = null;
                      });
                    },
                    icon: const Icon(Icons.delete_outline),
                    label: const Text("Remove"),
                  ),
                ],
              ),
            ] else
              OutlinedButton.icon(
                onPressed: _showImageSourceSheet,
                icon: const Icon(Icons.add_a_photo),
                label: const Text("Add Photo"),
              ),

            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {

                  if ((_needsManualName &&
                          nameController.text.trim().isEmpty) ||
                      descriptionController.text.trim().isEmpty) {

                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Please fill all required fields"),
                      ),
                    );
                    return;
                  }

                  // "Other" category: use the typed value if provided.
                  final resolvedCategory = category == "Other" &&
                          otherCategoryController.text.trim().isNotEmpty
                      ? otherCategoryController.text.trim()
                      : category;

                  // The Report table has no separate "name" column, so
                  // the reporter's name is folded into the description
                  // rather than silently discarded.
                  final reporterName = _resolveReporterName();
                  final combinedDescription =
                      "Reported by: $reporterName\n\n${descriptionController.text.trim()}";

                  final report = Report(
                    id: 0, // ignored by create() — Drift assigns the real id
                    latitude: latitude,
                    longitude: longitude,
                    description: combinedDescription,
                    category: resolvedCategory,
                    severity: severity,
                    imagePath: selectedImage?.path,
                    synced: false,
                    timestamp: DateTime.now(),
                  );

                  try {

                    await reportRepository.create(report);

                    if (!mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Report Submitted Successfully"),
                      ),
                    );

                    Navigator.pop(context);

                  } catch (e) {

                    if (!mounted) return;
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