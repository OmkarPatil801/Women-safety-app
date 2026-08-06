import 'package:cloud_firestore/cloud_firestore.dart';

class ReportModel {
  String id;
  String name;
  double latitude;
  double longitude;
  String description;
  String category;
  String severity;
  String imagePath;
  bool synced;
  Timestamp timestamp;

  ReportModel({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.description,
    required this.category,
    required this.severity,
    required this.imagePath,
    required this.synced,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'latitude': latitude,
      'longitude': longitude,
      'description': description,
      'category': category,
      'severity': severity,
      'imagePath': imagePath,
      'synced': synced,
      'timestamp': timestamp,
    };
  }

  factory ReportModel.fromMap(Map<String, dynamic> map) {
    return ReportModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      latitude: (map['latitude'] ?? 0).toDouble(),
      longitude: (map['longitude'] ?? 0).toDouble(),
      description: map['description'] ?? '',
      category: map['category'] ?? '',
      severity: map['severity'] ?? '',
      imagePath: map['imagePath'] ?? '',
      synced: map['synced'] ?? false,
      timestamp: map['timestamp'] ?? Timestamp.now(),
    );
  }
}