
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'state/auth_state.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(create: (_) => AuthState(), child: const KalimayaApp()),
  );
}

class KalimayaApp extends StatelessWidget {
  const KalimayaApp({super.key});
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthState>(builder: (ctx, auth, _) {
      return MaterialApp(
        title: 'Kalimaya',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorSchemeSeed: const Color(0xFF6366F1),
          useMaterial3: true,
          textTheme: GoogleFonts.interTextTheme(),
        ),
        home: auth.token == null ? const LoginScreen() : const HomeScreen(),
      );
    });
  }
}
