
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import '../services/api.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});
  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  Map? _today;
  List _history = [];
  bool _loading = true;
  String? _msg;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final tok = context.read<AuthState>().token!;
    final api = Api(tok);
    try {
      final td = await api.get('/attendance/today');
      final hist = await api.get('/attendance/me');
      setState(() {
        _today = td is Map && td['statusCode'] == null ? td : null;
        _history = hist is List ? hist : [];
        _loading = false;
      });
    } catch (_) { setState(() => _loading = false); }
  }

  Future<void> _action(String path) async {
    final tok = context.read<AuthState>().token!;
    final api = Api(tok);
    try {
      await api.post('/attendance/\$path', {});
      setState(() => _msg = path == 'checkin' ? '✅ Check-in berhasil' : '✅ Check-out berhasil');
      _load();
    } catch (e) { setState(() => _msg = 'Error: \$e'); }
  }

  String _fmt(String? iso) {
    if (iso == null) return '—';
    final dt = DateTime.parse(iso).toLocal();
    return '\${dt.hour.toString().padLeft(2,'0')}:\${dt.minute.toString().padLeft(2,'0')}';
  }

  Color _statusColor(String? s) {
    if (s == 'ON_TIME') return const Color(0xFF16A34A);
    if (s == 'LATE') return const Color(0xFFDC2626);
    if (s == 'EARLY') return const Color(0xFFD97706);
    return Colors.grey;
  }

  String _statusLabel(String? s) {
    if (s == 'ON_TIME') return 'Tepat Waktu';
    if (s == 'LATE') return 'Terlambat';
    if (s == 'EARLY') return 'Lebih Awal';
    return s ?? '—';
  }

  @override
  Widget build(BuildContext context) {
    final user = context.read<AuthState>().user;
    return Scaffold(
      appBar: AppBar(title: const Text('Absensi'), centerTitle: false,
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)]),
      body: _loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: _load,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          if (_msg != null) Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFBBF7D0))),
            child: Text(_msg!, style: const TextStyle(color: Color(0xFF16A34A))),
          ),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Hari Ini', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            Row(children: [
              _statBox('Masuk', _fmt(_today?['checkInAt']), const Color(0xFF16A34A)),
              const SizedBox(width: 8),
              _statBox('Pulang', _fmt(_today?['checkOutAt']), const Color(0xFFEA580C)),
              const SizedBox(width: 8),
              _statBox('Status', _statusLabel(_today?['status']), _statusColor(_today?['status'])),
            ]),
            const SizedBox(height: 16),
            const Text('Jam kerja: 09:00 – 17:00 WIB', style: TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: FilledButton.icon(
                onPressed: _today?['checkInAt'] != null ? null : () => _action('checkin'),
                icon: const Icon(Icons.login),
                label: Text(_today?['checkInAt'] != null ? 'Sudah Masuk' : 'Absen Masuk'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF16A34A)),
              )),
              const SizedBox(width: 8),
              Expanded(child: FilledButton.icon(
                onPressed: (_today?['checkInAt'] == null || _today?['checkOutAt'] != null) ? null : () => _action('checkout'),
                icon: const Icon(Icons.logout),
                label: Text(_today?['checkOutAt'] != null ? 'Sudah Pulang' : 'Absen Pulang'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFFEA580C)),
              )),
            ]),
          ]))),
          const SizedBox(height: 16),
          Text('Riwayat 30 Hari', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          ..._history.map((h) => Card(margin: const EdgeInsets.only(bottom: 8), child: ListTile(
            title: Text(_fmtDate(h['date']), style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text('Masuk: \${_fmt(h['checkInAt'])} · Pulang: \${_fmt(h['checkOutAt'])}'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: _statusColor(h['status']).withOpacity(.15), borderRadius: BorderRadius.circular(20)),
              child: Text(_statusLabel(h['status']), style: TextStyle(color: _statusColor(h['status']), fontWeight: FontWeight.w700, fontSize: 12)),
            ),
          ))),
          if (_history.isEmpty) const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Belum ada riwayat', style: TextStyle(color: Colors.grey)))),
        ]),
      ),
    );
  }

  Widget _statBox(String label, String value, Color color) => Expanded(child: Container(
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(color: color.withOpacity(.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(.3))),
    child: Column(children: [
      Text(label, style: TextStyle(fontSize: 10, color: color.withOpacity(.8))),
      const SizedBox(height: 4),
      Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: color)),
    ]),
  ));

  String _fmtDate(String? iso) {
    if (iso == null) return '—';
    final dt = DateTime.parse(iso);
    const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return '\${days[dt.weekday-1]}, \${dt.day} \${months[dt.month-1]}';
  }
}
