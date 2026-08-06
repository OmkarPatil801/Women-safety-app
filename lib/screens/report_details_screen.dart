import 'dart:io';

import 'package:flutter/material.dart';
import '../repositories/report_repository.dart';

class ReportDetailsScreen extends StatelessWidget {

  final Report report;

  const ReportDetailsScreen({
    super.key,
    required this.report,
  });

  Widget buildTile(String title, String value, {IconData? icon}) {

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),

      child: ListTile(
        leading: icon == null ? null : Icon(icon),
        title: Text(title),
        subtitle: Text(value),
      ),
    );

  }

  String _severityEmoji(String severity) {
    switch (severity) {
      case "Low":
        return "🟢";
      case "Medium":
        return "🟠";
      case "High":
        return "🔴";
      case "Critical":
        return "⚫";
      default:
        return "";
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      appBar: AppBar(
          title: const Text("Report Details"),
          actions: [
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: () async {
                bool? confirm = await showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text("Delete Report"),
                    content: const Text(
                      "Are you sure you want to delete this report?",
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text("Cancel"),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text("Delete"),
                      ),
                    ],
                  ),
                );

                if (confirm == true) {
                  await DriftReportRepository().delete(report.id);

                  if (context.mounted) {
                    Navigator.pop(context);

                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Report Deleted"),
                      ),
                    );
                  }
                }
              },
            ),
          ],
        ),
      body: SingleChildScrollView(

        padding: const EdgeInsets.all(15),

        child: Column(

          children: [

            if (report.imagePath != null)
              Card(
                margin: const EdgeInsets.symmetric(vertical: 8),
                clipBehavior: Clip.antiAlias,
                child: Image.file(
                  File(report.imagePath!),
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),

            buildTile("Category", report.category, icon: Icons.category),

            buildTile(
              "Severity",
              "${_severityEmoji(report.severity)} ${report.severity}",
              icon: Icons.warning_amber_rounded,
            ),

            buildTile(
              "Location",
              "${report.latitude}, ${report.longitude}",
              icon: Icons.location_on,
            ),

            buildTile(
              "Description",
              (report.description ?? "").isEmpty
                  ? "No description provided"
                  : report.description!,
              icon: Icons.description,
            ),

            buildTile(
              "Timestamp",
              report.timestamp.toString(),
              icon: Icons.access_time,
            ),

            buildTile(
              "Sync Status",
              report.synced ? "🟢 Synced" : "🟡 Pending Sync",
              icon: Icons.sync,
            ),

          ],
        ),
      ),
    );
  }
}
