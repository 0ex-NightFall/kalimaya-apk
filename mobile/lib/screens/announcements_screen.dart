import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import '../services/api.dart';

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({super.key});
  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  List _items = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final tok = context.read<AuthState>().token!;
    try {
      final data = await Api(tok).get('/announcements');
      setState(() { _items = data is List ? data : []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  String _fmtDate(String? iso) {
    if (iso == null) return '';
    final dt = DateTime.parse(iso).toLocal();
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    final h = dt.hour.toString().padLeft(2, "0");
    final m = dt.minute.toString().padLeft(2, "0");
    return '${dt.day} ${months[dt.month-1]} ${dt.year}, $h:$m';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pengumuman'), centerTitle: false,
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)]),
      body: _loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: _load,
        child: _items.isEmpty
          ? const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.campaign_outlined, size: 64, color: Colors.grey),
              SizedBox(height: 12),
              Text('Belum ada pengumuman', style: TextStyle(color: Colors.grey)),
            ]))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _items.length,
              itemBuilder: (ctx, i) {
                final item = _items[i];
                final isHigh = item['priority'] == 'HIGH';
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: isHigh ? const Color(0xFFDC2626) : Colors.transparent, width: 1.5),
                  ),
                  child: Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Expanded(child: Text(item['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15))),
                      if (isHigh) Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: const Color(0xFFDC2626).withOpacity(.1), borderRadius: BorderRadius.circular(20)),
                        child: const Text('PENTING', style: TextStyle(color: Color(0xFFDC2626), fontSize: 10, fontWeight: FontWeight.w800)),
                      ),
                    ]),
                    const SizedBox(height: 8),
                    Text(item['body'] ?? '', style: const TextStyle(fontSize: 14, height: 1.5)),
                    const SizedBox(height: 8),
                    Text(_fmtDate(item['createdAt']), style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  ])),
                );
              },
            ),
      ),
    );
  }
}
