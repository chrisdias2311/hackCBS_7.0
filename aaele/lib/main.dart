import 'dart:developer';

import 'package:aaele/auth/screens/login_screen.dart';
import 'package:aaele/widgets/custom_bottom_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:flutter_gemini/flutter_gemini.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  // Gemini.init(apiKey: "AIzaSyBuZr6PhkGpecYjISGJ3Q-Fce0oj5NppPA");
  WidgetsFlutterBinding.ensureInitialized();
  SharedPreferences sharedPreferences = await SharedPreferences.getInstance();
  var username = sharedPreferences.getString('name');
  log(username ?? "Not Stored");
  runApp(ProviderScope(
    child: MyApp(username: username ?? ""),
  ));
}

// ignore: must_be_immutable
class MyApp extends StatelessWidget {
  String username;
  MyApp({super.key, required this.username});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AAELE',
      home: (username != "") ? const CustomBottomBar() : const LoginScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
