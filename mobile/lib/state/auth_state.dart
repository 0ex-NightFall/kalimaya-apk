
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../config.dart';

class AuthState extends ChangeNotifier {
  String? token;
  Map<String, dynamic>? user;

  AuthState() { _load(); }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token');
    final u = prefs.getString('user');
    if (u != null) user = jsonDecode(u);
    notifyListeners();
  }

  Future<String?> login(String username, String password) async {
    try {
      final res = await http.post(
        Uri.parse('\$kApiBaseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        token = data['accessToken'];
        user = data['user'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token!);
        await prefs.setString('user', jsonEncode(user));
        notifyListeners();
        return null;
      }
      return jsonDecode(res.body)['message'] ?? 'Login gagal';
    } catch (e) {
      return 'Tidak dapat terhubung ke server';
    }
  }

  Future<void> logout() async {
    token = null; user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    notifyListeners();
  }

  bool get isAdmin => (user?['roles'] as List?)?.any((r) => r == 'DIRECTOR' || r == 'ADMIN_IT') ?? false;
}
