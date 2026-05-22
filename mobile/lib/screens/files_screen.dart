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
  List<dynamic> items = [];
  bool loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final tok = context.read<AuthState>().token!;
    final d = await ApiService.getFiles(tok);
    setState(() { items = d; loading = false; });
  }

  String _fmtSize(dynamic bytes) {
    final b = (bytes ?? 0) as num;
    if (b < 1024) return '${b}B';
    if (b < 1024 * 1024) return '${(b / 1024).toStringAsFixed(1)}KB';
    return '${(b / 1024 / 1024).toStringAsFixed(1)}MB';
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (items.isEmpty) return const Center(child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [Text('📂', style: TextStyle(fontSize: 48)), SizedBox(height: 12), Text('Belum ada file')],
    ));
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: items.length,
        itemBuilder: (ctx, i) {
          final f = items[i];
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: const Icon(Icons.insert_drive_file, color: Colors.indigo),
              title: Text(f['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Text('${_fmtSize(f['sizeBytes'])} · ${f['mimeType'] ?? ''}'),
              trailing: IconButton(
                icon: const Icon(Icons.download, color: Colors.indigo),
                onPressed: () {
                  final tok = context.read<AuthState>().token!;
                  final url = 'https://wanted-films-listprice-application.trycloudflare.com/api/files/${f['id']}/download';
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Download: ${f['name']}')));
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
