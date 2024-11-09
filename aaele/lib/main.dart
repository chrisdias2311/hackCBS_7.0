import 'dart:developer';

import 'package:aaele/auth/screens/login_screen.dart';
import 'package:aaele/widgets/custom_bottom_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:flutter_gemini/flutter_gemini.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SharedPreferences sharedPreferences = await SharedPreferences.getInstance();
  var username = sharedPreferences.getString('name');
  var role = sharedPreferences.getString('role');
  log(username ?? "Not Stored");
  runApp(ProviderScope(
    child: MyApp(username: username ?? "", role: role ?? "Student"),
  ));
}

// ignore: must_be_immutable
class MyApp extends StatelessWidget {
  String username;
  String role;
  MyApp({super.key, required this.username, required this.role});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AAELE',
      home: (username != "") ? CustomBottomBar(role: role,) : const LoginScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
