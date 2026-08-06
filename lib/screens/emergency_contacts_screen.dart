import 'package:flutter/material.dart';

import '../repositories/contact_repository.dart';

/// The real "Emergency Contacts" screen — fulfils the promise already
/// printed on the home screen's feature tile ("Add & manage your trusted
/// contacts"), backed by [ContactRepository].
///
/// Contacts are device-local with no owning-user field (see the Drift
/// `Contacts` table), so this screen no longer takes a `userId` — every
/// saved contact is simply available to whoever is using the device,
/// which still preserves the app's "SOS works without login" behavior.
class EmergencyContactsScreen extends StatefulWidget {
  EmergencyContactsScreen({ContactRepository? repository})
      : repository = repository ?? DriftContactRepository();

  final ContactRepository repository;

  @override
  State<EmergencyContactsScreen> createState() =>
      _EmergencyContactsScreenState();
}

class _EmergencyContactsScreenState extends State<EmergencyContactsScreen> {
  final TextEditingController _searchController = TextEditingController();

  List<Contact> _contacts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadContacts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _sortContacts(List<Contact> contacts) {
    contacts.sort((a, b) {
      if (a.isPrimary != b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
  }

  Future<void> _loadContacts() async {
    setState(() => _isLoading = true);
    final contacts = await widget.repository.getAll();
    _sortContacts(contacts);
    if (!mounted) return;
    setState(() {
      _contacts = contacts;
      _isLoading = false;
    });
  }

  Future<void> _onSearchChanged(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      await _loadContacts();
      return;
    }

    setState(() => _isLoading = true);
    final results = await widget.repository.search(trimmed);
    _sortContacts(results);
    if (!mounted) return;
    setState(() {
      _contacts = results;
      _isLoading = false;
    });
  }

  Future<void> _saveContact({
    required Contact? existing,
    required String name,
    required String phone,
    required String? relationship,
    required bool isPrimary,
  }) async {
    // No exclusivity rule here on purpose — any number of contacts may
    // be marked Primary at once.
    final contact = Contact(
      id: existing?.id ?? 0,
      name: name,
      phone: phone,
      relationship: relationship,
      isPrimary: isPrimary,
    );

    if (existing != null) {
      await widget.repository.update(contact);
    } else {
      await widget.repository.create(contact);
    }

    _searchController.clear();
    await _loadContacts();
  }

  Future<void> _deleteContact(Contact contact) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2B1010),
        title: const Text('Delete contact?',
            style: TextStyle(color: Colors.white)),
        content: Text(
          'Remove ${contact.name} from your emergency contacts?',
          style: TextStyle(color: Colors.grey[400]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete',
                style: TextStyle(color: Color(0xFFF1948A))),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await widget.repository.delete(contact.id);
      await _loadContacts();
    }
  }

  void _showContactForm({Contact? existing}) {
    showDialog<void>(
      context: context,
      builder: (context) => _ContactFormDialog(
        existing: existing,
        onSave: (name, phone, relationship, isPrimary) => _saveContact(
          existing: existing,
          name: name,
          phone: phone,
          relationship: relationship,
          isPrimary: isPrimary,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A0A0A),
        elevation: 0,
        leading: BackButton(color: Colors.white),
        title: const Text(
          'Emergency Contacts',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFFC0392B),
        onPressed: () => _showContactForm(),
        child: const Icon(Icons.person_add, color: Colors.white),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: _buildSearchField(),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _contacts.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _contacts.length,
                        itemBuilder: (context, index) =>
                            _buildContactTile(_contacts[index]),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return TextField(
      controller: _searchController,
      onChanged: _onSearchChanged,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: 'Search contacts',
        hintStyle: TextStyle(color: Colors.grey[600], fontSize: 13),
        prefixIcon: const Icon(Icons.search, color: Colors.grey),
        filled: true,
        fillColor: Colors.white.withOpacity(0.04),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide:
              BorderSide(color: const Color(0xFFC0392B).withOpacity(0.2)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide:
              BorderSide(color: const Color(0xFFC0392B).withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide:
              BorderSide(color: const Color(0xFFC0392B).withOpacity(0.6)),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.contacts_outlined, color: Colors.grey[700], size: 64),
            const SizedBox(height: 16),
            const Text(
              'No emergency contacts yet',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Tap + to add your first trusted contact.',
              style: TextStyle(color: Colors.grey[500], fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactTile(Contact contact) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF2B1010),
        borderRadius: BorderRadius.circular(14),
        border:
            Border.all(color: const Color(0xFFC0392B).withOpacity(0.18)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: const Color(0xFFC0392B),
            child: Text(
              contact.name.isNotEmpty ? contact.name[0].toUpperCase() : '?',
              style:
                  const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    // Primary Emergency Contacts get a star prefix on
                    // their name (e.g. "⭐ Mom") so it's clear at a
                    // glance which contacts SOS will message.
                    Flexible(
                      child: Text(
                        contact.isPrimary
                            ? '⭐ ${contact.name}'
                            : contact.name,
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                Text(
                  contact.relationship != null
                      ? '${contact.phone} · ${contact.relationship}'
                      : contact.phone,
                  style: TextStyle(color: Colors.grey[400], fontSize: 12),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit, color: Colors.grey, size: 20),
            onPressed: () => _showContactForm(existing: contact),
          ),
          IconButton(
            icon: Icon(Icons.delete_outline,
                color: const Color(0xFFF1948A), size: 20),
            onPressed: () => _deleteContact(contact),
          ),
        ],
      ),
    );
  }
}

/// The Add/Edit contact form, shown as a dialog.
class _ContactFormDialog extends StatefulWidget {
  const _ContactFormDialog({required this.existing, required this.onSave});

  final Contact? existing;
  final Future<void> Function(
    String name,
    String phone,
    String? relationship,
    bool isPrimary,
  ) onSave;

  @override
  State<_ContactFormDialog> createState() => _ContactFormDialogState();
}

class _ContactFormDialogState extends State<_ContactFormDialog> {
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _relationshipController;
  late bool _isPrimary;

  String? _errorMsg;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final existing = widget.existing;
    _nameController = TextEditingController(text: existing?.name ?? '');
    _phoneController = TextEditingController(text: existing?.phone ?? '');
    _relationshipController =
        TextEditingController(text: existing?.relationship ?? '');
    _isPrimary = existing?.isPrimary ?? false;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _relationshipController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();

    if (name.isEmpty || phone.isEmpty) {
      setState(() => _errorMsg = 'Name and phone number are required.');
      return;
    }

    setState(() {
      _errorMsg = null;
      _isSaving = true;
    });

    final relationship = _relationshipController.text.trim();
    await widget.onSave(
      name,
      phone,
      relationship.isEmpty ? null : relationship,
      _isPrimary,
    );

    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.existing != null;

    return AlertDialog(
      backgroundColor: const Color(0xFF2B1010),
      title: Text(
        isEditing ? 'Edit Contact' : 'Add Contact',
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _field(_nameController, 'Full Name', TextInputType.name),
            const SizedBox(height: 12),
            _field(_phoneController, 'Phone Number', TextInputType.phone),
            const SizedBox(height: 12),
            _field(_relationshipController, 'Relationship (optional)',
                TextInputType.text),
            const SizedBox(height: 8),
            Row(
              children: [
                Switch(
                  value: _isPrimary,
                  activeColor: const Color(0xFFC0392B),
                  onChanged: (value) => setState(() => _isPrimary = value),
                ),
                Expanded(
                  child: Text(
                    'Primary Emergency Contact',
                    style: TextStyle(color: Colors.grey[400], fontSize: 13),
                  ),
                ),
              ],
            ),
            if (_errorMsg != null) ...[
              const SizedBox(height: 8),
              Text(_errorMsg!,
                  style: const TextStyle(
                      color: Color(0xFFF1948A), fontSize: 12)),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSaving ? null : () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
        ),
        ElevatedButton(
          onPressed: _isSaving ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFC0392B),
            foregroundColor: Colors.white,
          ),
          child: Text(isEditing ? 'Save' : 'Add'),
        ),
      ],
    );
  }

  Widget _field(
    TextEditingController controller,
    String hint,
    TextInputType type,
  ) {
    return TextField(
      controller: controller,
      keyboardType: type,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey[600], fontSize: 13),
        filled: true,
        fillColor: Colors.white.withOpacity(0.04),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide:
              BorderSide(color: const Color(0xFFC0392B).withOpacity(0.2)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide:
              BorderSide(color: const Color(0xFFC0392B).withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide:
              BorderSide(color: const Color(0xFFC0392B).withOpacity(0.6)),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
    );
  }
}
