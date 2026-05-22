import 'package:flutter/material.dart';

class AppState extends ChangeNotifier {
  Locale _locale = const Locale('id');
  Locale get locale => _locale;

  void toggleLocale() {
    _locale = _locale.languageCode == 'id' ? const Locale('en') : const Locale('id');
    notifyListeners();
  }
}
