
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class Api {
  final String token;
  Api(this.token);

  Map<String, String> get _h => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer \$token',
  };

  Future<dynamic> get(String path) async {
    final res = await http.get(Uri.parse('\$kApiBaseUrl\$path'), headers: _h);
    return jsonDecode(res.body);
  }

  Future<dynamic> post(String path, Map body) async {
    final res = await http.post(Uri.parse('\$kApiBaseUrl\$path'), headers: _h, body: jsonEncode(body));
    return jsonDecode(res.body);
  }

  Future<dynamic> patch(String path, Map body) async {
    final res = await http.patch(Uri.parse('\$kApiBaseUrl\$path'), headers: _h, body: jsonEncode(body));
    return jsonDecode(res.body);
  }

  Future<dynamic> delete(String path) async {
    final res = await http.delete(Uri.parse('\$kApiBaseUrl\$path'), headers: _h);
    if (res.body.isEmpty) return {'ok': true};
    return jsonDecode(res.body);
  }
}
