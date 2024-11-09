import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;


import 'package:aaele/models/user_model.dart';

class AuthRepository {
  String userName = "";
  Future logIn(BuildContext context, String username, int pid) async {
    try {
      http.Response res = await http.post(
        Uri.parse(
            "https://mood-lens-server.onrender.com/api/v1/student_reports/login"),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode({
          "username": username,
          "pid" : pid
        }),
      );
      userName = username;
      return UserModel.fromJson(jsonDecode(res.body)['user']);
    } catch (e) {
      // ignore: use_build_context_synchronously
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }
}