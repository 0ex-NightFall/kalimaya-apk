import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import '../services/api.dart';

class FilesScreen extends StatefulWidget {
  const FilesScreen({super.key});
  @override
  State<FilesScreen> createState() => _FilesScreenState();
}

class _FilesScreenState extends State<FilesScreen> {
  List _files = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final tok = context.read<AuthState>().token!;
    try {
      final data = await Api(tok).get('/files');
      setState(() { _files = data is List ? data : []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('File'), centerTitle: false,
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)]),
      body: _loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: _load,
        child: _files.isEmpty
          ? const Center(child: Text('Belum ada file', style: TextStyle(color: Colors.grey)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _files.length,
              itemBuilder: (ctx, i) {
                final f = _files[i];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: const Icon(Icons.insert_drive_file_outlined, color: Color(0xFF6366F1)),
                    title: Text(f['originalName'] ?? f['filename'] ?? 'File', style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text(f['uploader']?['fullName'] ?? '—', style: const TextStyle(fontSize: 12)),
                  ),
                );
              },
            ),
      ),
    );
  }
}
