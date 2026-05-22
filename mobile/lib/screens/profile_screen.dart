import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final user = auth.user;
    return Scaffold(
      appBar: AppBar(title: const Text('Profil'), centerTitle: false),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        Center(child: Column(children: [
          Container(
            width: 80, height: 80,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(colors: [Color(0xFF6366F1), Color(0xFFA855F7)], begin: Alignment.topLeft, end: Alignment.bottomRight),
            ),
            child: Center(child: Text(
              (user?['fullName'] as String? ?? 'A')[0].toUpperCase(),
              style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
            )),
          ),
          const SizedBox(height: 12),
          Text(user?['fullName'] ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text('@${user?["username"] ?? ""}', style: const TextStyle(color: Colors.grey)),
          if (user?['jobTitle'] != null) ...[
            const SizedBox(height: 4),
            Text(user!['jobTitle'], style: const TextStyle(color: Colors.grey)),
          ],
        ])),
        const SizedBox(height: 24),
        Card(child: Column(children: [
          _tile(Icons.email_outlined, 'Email', user?['email'] ?? '—'),
          const Divider(height: 1),
          _tile(Icons.business_outlined, 'Divisi', user?['division']?['name'] ?? '—'),
          const Divider(height: 1),
          _tile(Icons.badge_outlined, 'Role', (user?['roles'] as List?)?.where((r) => r != 'ADMIN_IT').join(', ') ?? '—'),
        ])),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: () => auth.logout(),
          icon: const Icon(Icons.logout),
          label: const Text('Keluar'),
          style: FilledButton.styleFrom(backgroundColor: const Color(0xFFDC2626), padding: const EdgeInsets.symmetric(vertical: 14)),
        ),
      ]),
    );
  }

  Widget _tile(IconData icon, String label, String value) => ListTile(
    leading: Icon(icon, color: const Color(0xFF6366F1)),
    title: Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
    subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
  );
}
