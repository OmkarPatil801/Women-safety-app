import 'package:flutter/material.dart';
import 'add_report_screen.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../services/firestore_service.dart';
import 'report_details_screen.dart';

class ReportsScreen extends StatelessWidget {
  ReportsScreen({super.key});
  final FirestoreService firestoreService = FirestoreService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A0A0A),

      appBar: AppBar(
        backgroundColor: const Color(0xFF1A0A0A),
        title: const Text("Incident Reports"),
      ),

      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.red,
        child: const Icon(Icons.add),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => const AddReportScreen(),
            ),
          );
        },
      ),

      body: StreamBuilder<QuerySnapshot>(
        stream: firestoreService.getReports(),
        builder: (context, snapshot) {
        
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return const Center(
              child: Text(
                "No Reports Yet",
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          final reports = snapshot.data!.docs;

          return ListView.builder(
            itemCount: reports.length,

            itemBuilder: (context, index) {
            
              final report =
                  reports[index].data() as Map<String, dynamic>;

              return Card(
                color: Colors.grey.shade900,
                margin: const EdgeInsets.all(10),
              
                child: InkWell(
                
                  onTap: () {
                  
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ReportDetailsScreen(
                          report: report,
                        ),
                      ),
                    );
              
                  },
              
                  child: ListTile(
                  
                    leading: const Icon(
                      Icons.report,
                      color: Colors.red,
                    ),
              
                    title: Text(
                      report["name"] ?? "",
                      style: const TextStyle(color: Colors.white),
                    ),
              
                    subtitle: Text(
                      "${report["category"]} • ${report["severity"]}",
                      style: const TextStyle(color: Colors.grey),
                    ),
              
                    trailing: const Icon(
                      Icons.arrow_forward_ios,
                      color: Colors.white,
                      size: 16,
                    ),
              
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}