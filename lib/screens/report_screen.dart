import 'dart:async';

import 'package:flutter/material.dart';
import 'add_report_screen.dart';
import 'report_details_screen.dart';
import '../repositories/report_repository.dart';

class ReportsScreen extends StatefulWidget {
  ReportsScreen({super.key, ReportRepository? repository})
      : repository = repository ?? DriftReportRepository();

  final ReportRepository repository;

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  List<Report> _reports = [];
  List<Report> _allReports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  /// Reloads the list using whatever is currently in the search bar —
  /// used both for the initial load and after returning from Add/Details,
  /// so an active search stays applied instead of silently resetting.
  ///
  /// Also refreshes the unfiltered set used for the statistics section,
  /// since stats should always describe every report, not just the
  /// current search results.
  Future<void> _loadReports() async {
    setState(() => _isLoading = true);

    final query = _searchController.text.trim();
    final allReports = await widget.repository.getAll();
    final reports = query.isEmpty
        ? allReports
        : await widget.repository.search(query);

    if (!mounted) return;
    setState(() {
      _reports = reports;
      _allReports = allReports;
      _isLoading = false;
    });
  }

  int get _totalReports => _allReports.length;

  int get _pendingSyncCount =>
      _allReports.where((r) => !r.synced).length;

  int get _categoriesCount =>
      _allReports.map((r) => r.category).toSet().length;

  int get _highSeverityCount => _allReports
      .where((r) => r.severity == "High" || r.severity == "Critical")
      .length;

  /// Debounced so typing stays responsive — each keystroke resets a short
  /// timer instead of firing a database query per character.
  void _onSearchChanged(String _) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), _loadReports);
  }

  Widget _statTile(String label, String value, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
        decoration: BoxDecoration(
          color: Colors.grey.shade900,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.4)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 10, 10, 0),
      child: Row(
        children: [
          _statTile("Total\nReports", "$_totalReports", Colors.blue),
          _statTile("Pending\nSync", "$_pendingSyncCount", Colors.orange),
          _statTile("Categories", "$_categoriesCount", Colors.purple),
          _statTile("High\nSeverity", "$_highSeverityCount", Colors.red),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A0A0A),

      appBar: AppBar(
        backgroundColor: const Color(0xFF1A0A0A),
        title: const Text("Incident Reports"),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: ValueListenableBuilder<TextEditingValue>(
              valueListenable: _searchController,
              builder: (context, value, _) {
                return TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: "Search by category, severity, or description",
                    hintStyle: const TextStyle(color: Colors.grey),
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    suffixIcon: value.text.isEmpty
                        ? null
                        : IconButton(
                            icon: const Icon(Icons.clear, color: Colors.grey),
                            onPressed: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                          ),
                    filled: true,
                    fillColor: Colors.grey.shade900,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),

      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.red,
        child: const Icon(Icons.add),
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => const AddReportScreen(),
            ),
          );
          _loadReports();
        },
      ),

      body: Column(
        children: [
          if (!_isLoading) _buildStatsSection(),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : RefreshIndicator(
                    onRefresh: _loadReports,
                    child: _reports.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              SizedBox(
                                height:
                                    MediaQuery.of(context).size.height * 0.6,
                                child: Center(
                                  child: Text(
                                    _searchController.text.trim().isEmpty
                                        ? "No Reports Yet"
                                        : "No Reports Match Your Search",
                                    style:
                                        const TextStyle(color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        itemCount: _reports.length,

                        itemBuilder: (context, index) {
                    final report = _reports[index];

                    return Card(
                      color: Colors.grey.shade900,
                      margin: const EdgeInsets.all(10),

                      child: InkWell(

                        onTap: () async {

                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ReportDetailsScreen(
                                report: report,
                              ),
                            ),
                          );
                          _loadReports();

                        },

                        child: ListTile(

                          leading: const Icon(
                            Icons.report,
                            color: Colors.red,
                          ),

                          title: Text(
                            report.category,
                            style: const TextStyle(color: Colors.white),
                          ),

                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                "${report.severity} • ${_formatDate(report.timestamp)}",
                                style: const TextStyle(color: Colors.grey),
                              ),
                              const SizedBox(height: 6),
                              Chip(
                                label: Text(
                                  report.synced
                                      ? "🟢 Synced"
                                      : "🟡 Pending Sync",
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Colors.white,
                                  ),
                                ),
                                backgroundColor: report.synced
                                    ? Colors.green.shade800
                                    : Colors.orange.shade800,
                                padding: EdgeInsets.zero,
                                labelPadding: const EdgeInsets.symmetric(
                                    horizontal: 8),
                                materialTapTargetSize:
                                    MaterialTapTargetSize.shrinkWrap,
                                visualDensity: VisualDensity.compact,
                              ),
                            ],
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
                ),
                  ),
          ),
        ],
      ),
    );
  }
}
