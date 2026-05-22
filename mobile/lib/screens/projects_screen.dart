
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import '../services/api.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});
  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  List _items = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final tok = context.read<AuthState>().token!;
    try {
      final data = await Api(tok).get('/projects');
      setState(() { _items = data is List ? data : []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  Color _statusColor(String? s) {
    if (s == 'ACTIVE') return const Color(0xFF16A34A);
    if (s == 'PLANNING') return const Color(0xFFD97706);
    if (s == 'COMPLETED') return const Color(0xFF6366F1);
    return Colors.grey;
  }

  String _statusLabel(String? s) {
    if (s == 'ACTIVE') return 'Aktif';
    if (s == 'PLANNING') return 'Perencanaan';
    if (s == 'COMPLETED') return 'Selesai';
    if (s == 'ON_HOLD') return 'Ditunda';
    return s ?? '—';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Proyek'), centerTitle: false,
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)]),
      body: _loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: _load,
        child: _items.isEmpty
          ? const Center(child: Text('Belum ada proyek', style: TextStyle(color: Colors.grey)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (ctx, i) {
                final p = _items[i];
                final color = _statusColor(p['status']);
                final pct = (p['progressPercent'] ?? 0).toDouble();
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Expanded(child: Text(p['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15))),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: color.withOpacity(.1), borderRadius: BorderRadius.circular(20)),
                        child: Text(_statusLabel(p['status']), style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
                      ),
                    ]),
                    if (p['description'] != null && p['description'].toString().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(p['description'], style: const TextStyle(color: Colors.grey, fontSize: 13)),
                    ],
                    const SizedBox(height: 12),
                    Row(children: [
                      Expanded(child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(value: pct / 100, backgroundColor: Colors.grey.shade200, color: color, minHeight: 8),
                      )),
                      const SizedBox(width: 10),
                      Text('\${pct.toInt()}%', style: TextStyle(fontWeight: FontWeight.w800, color: color)),
                    ]),
                  ])),
                );
              },
            ),
      ),
    );
  }
}
