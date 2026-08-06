import 'package:flutter/material.dart';
import '../services/firestore_service.dart';

class ReportDetailsScreen extends StatelessWidget {

  final Map<String, dynamic> report;

  const ReportDetailsScreen({
    super.key,
    required this.report,
  });

  Widget buildTile(String title, String value) {

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),

      child: ListTile(
        title: Text(title),
        subtitle: Text(value),
      ),
    );

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
                  await FirestoreService().deleteReport(report["id"]);

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

            buildTile("Report ID", report["id"].toString()),

            buildTile("Name", report["name"].toString()),

            buildTile("Category", report["category"].toString()),

            buildTile("Severity", report["severity"].toString()),

            buildTile("Description", report["description"].toString()),

            buildTile("Latitude", report["latitude"].toString()),

            buildTile("Longitude", report["longitude"].toString()),

            buildTile("Timestamp",
                report["timestamp"].toDate().toString()),

          ],
        ),
      ),
    );
  }
}