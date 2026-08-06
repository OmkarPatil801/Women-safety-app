import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/report_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<void> saveReport(ReportModel report) async {
    await _firestore
        .collection('incidentReports')
        .doc(report.id)
        .set(report.toMap());
  }

  Stream<QuerySnapshot> getReports() {
  return _firestore
      .collection('incidentReports')
      .orderBy('timestamp', descending: true)
      .snapshots();
}
Future<void> deleteReport(String reportId) async {
  await _firestore
      .collection('incidentReports')
      .doc(reportId)
      .delete();
}
}