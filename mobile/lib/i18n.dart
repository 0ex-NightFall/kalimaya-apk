import 'package:flutter/widgets.dart';

class L {
  L(this.locale);
  final Locale locale;

  static const _strings = <String, Map<String, String>>{
    'app_name': {'id': 'Kalimaya', 'en': 'Kalimaya'},
    'tagline': {'id': 'Aplikasi Internal Kantor', 'en': 'Internal Office App'},
    'login': {'id': 'Masuk', 'en': 'Login'},
    'username': {'id': 'Username atau Email', 'en': 'Username or Email'},
    'password': {'id': 'Kata Sandi', 'en': 'Password'},
    'forgot_password': {'id': 'Lupa kata sandi?', 'en': 'Forgot password?'},
    'home': {'id': 'Beranda', 'en': 'Home'},
    'attendance': {'id': 'Absensi', 'en': 'Attendance'},
    'projects': {'id': 'Project', 'en': 'Projects'},
    'files': {'id': 'File', 'en': 'Files'},
    'profile': {'id': 'Profil', 'en': 'Profile'},
    'check_in': {'id': 'Masuk Kerja', 'en': 'Check In'},
    'check_out': {'id': 'Pulang Kerja', 'en': 'Check Out'},
    'logout': {'id': 'Keluar', 'en': 'Logout'},
    'language': {'id': 'Bahasa', 'en': 'Language'},
    'good_morning': {'id': 'Selamat pagi', 'en': 'Good morning'},
    'good_afternoon': {'id': 'Selamat siang', 'en': 'Good afternoon'},
    'good_evening': {'id': 'Selamat malam', 'en': 'Good evening'},
    'today': {'id': 'Hari ini', 'en': 'Today'},
    'no_data': {'id': 'Belum ada data', 'en': 'No data yet'},
  };

  String t(String key) {
    final code = locale.languageCode == 'en' ? 'en' : 'id';
    return _strings[key]?[code] ?? key;
  }
}
