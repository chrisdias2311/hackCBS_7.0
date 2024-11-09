import 'dart:developer';

import 'package:aaele/auth/repository/auth_repository.dart';
import 'package:aaele/database.dart';
import 'package:aaele/models/user_model.dart';
import 'package:aaele/widgets/custom_bottom_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {

  TextEditingController _usernameController = TextEditingController();
  TextEditingController _pidController = TextEditingController();

  bool isLoading = false;

  void login() async {
    setState(() {
      isLoading = true;
    });
    AuthRepository homeRepository = AuthRepository();
    String username = _usernameController.text.trim();
    int pid = int.parse(_pidController.text.trim());
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    UserModel user = await homeRepository.logIn(context, username, pid);
    prefs.setInt("student_id", pid);
    prefs.setString("name", user.userName);
    prefs.setString("role", selectedIndex == 0 ? "Student" : 'Parents');
    ref.read(userRoleProvider.notifier).state = selectedIndex == 0 ? "Student" : 'Parents';
    setState(() {
      isLoading = false;
    });
    Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const CustomBottomBar()),
        (Route<dynamic> route) => false);
  }

  var selectedIndex = 0;

  void selectTab(int index) {
    setState(() {
      selectedIndex = index;
    });
  }

  @override
  void initState() {
    super.initState();
    // pages = [StudentForm(), ParentForm()];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 180.0, left: 20),
              child: RichText(
                text: TextSpan(
                  children: [
                    const TextSpan(
                        text: "Video Call\n",
                        style: TextStyle(
                            color: Colors.black,
                            fontSize: 34,
                            fontWeight: FontWeight.bold)),
                    TextSpan(
                        text: "AAELE login",
                        style: TextStyle(
                            color: Colors.blue.shade700,
                            fontSize: 38,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 20),
              child: Text(
                "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. ",
                style: TextStyle(color: Colors.grey.shade500),
              ),
            ),
            SizedBox(height: 70),
            isLoading
                ? const Center(child: CircularProgressIndicator())
                : Align(
                    alignment: Alignment.bottomCenter,
                    child: Container(
                      margin: const EdgeInsets.only(
                          left: 10, right: 10, top: 10, bottom: 70),
                      height: 401,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              width: 1.0, color: Colors.grey.shade300)),
                      child: Padding(
                        padding: const EdgeInsets.only(
                            left: 12, right: 12, top: 22, bottom: 12),
                        child: Column(
                          children: [
                            const Icon(
                              Icons.person_outline,
                              size: 40,
                            ),
                            const SizedBox(height: 15),
                            LoginToggleButton(),
                            const SizedBox(height: 25),
                            SizedBox(
                              width: 350,
                              child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: TextFormField(
                                  onChanged: (value) {
                                    setState(() {
                                      _usernameController.text = value;
                                    });
                                  },
                                  controller: _usernameController,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: InputDecoration(
                                      suffix: _usernameController.text.length >
                                              9
                                          ? Container(
                                              height: 16,
                                              width: 16,
                                              decoration: const BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: Colors.green),
                                              child: const Icon(
                                                Icons.done_outline_rounded,
                                                size: 12,
                                                color: Colors.white,
                                              ),
                                            )
                                          // ? const Icon(Icons.done_outline_rounded, color: Colors.green, size: 12,)
                                          : null,
                                      hintText: "  Enter your username",
                                      enabledBorder: const UnderlineInputBorder(
                                        borderSide:
                                            BorderSide(color: Colors.grey),
                                      ),
                                      focusedBorder: const UnderlineInputBorder(
                                        borderSide:
                                            BorderSide(color: Colors.black),
                                      ),
                                      prefixIcon: Container(
                                        padding: const EdgeInsets.only(
                                            left: 8, right: 8, top: 11.5),
                                        child: Icon(Icons.email),
                                      )),
                                ),
                              ),
                            ),
                            SizedBox(
                              width: 350,
                              child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: TextFormField(
                                  onChanged: (value) {
                                    setState(() {
                                      _pidController.text = value;
                                    });
                                  },
                                  controller: _pidController,
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                      suffix: _pidController.text.length > 9
                                          ? Container(
                                              height: 16,
                                              width: 16,
                                              decoration: const BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: Colors.green),
                                              child: const Icon(
                                                Icons.done_outline_rounded,
                                                size: 12,
                                                color: Colors.white,
                                              ),
                                            )
                                          // ? const Icon(Icons.done_outline_rounded, color: Colors.green, size: 12,)
                                          : null,
                                      hintText: "  Enter your password",
                                      enabledBorder: const UnderlineInputBorder(
                                        borderSide:
                                            BorderSide(color: Colors.grey),
                                      ),
                                      focusedBorder: const UnderlineInputBorder(
                                        borderSide:
                                            BorderSide(color: Colors.black),
                                      ),
                                      prefixIcon: Container(
                                        padding: const EdgeInsets.only(
                                            left: 8, right: 8, top: 11.5),
                                        child: const Icon(Icons.password),
                                      )),
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 25,
                            ),
                            SizedBox(
                              height: 50,
                              width: 320,
                              child: ElevatedButton(
                                onPressed: () {
                                  if (_usernameController.text.trim().length ==
                                          0 ||
                                      _pidController.text.trim().length == 0) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                            content: Text(
                                                "Enter valid credentials")));
                                  }
                                  login();
                                },
                                style: ElevatedButton.styleFrom(
                                    backgroundColor:
                                        const Color.fromARGB(255, 27, 78, 165),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    )),
                                child: const Text(
                                  "LOGIN",
                                  style: TextStyle(
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(
                              height: 20,
                            ),
                            RichText(
                                text: const TextSpan(children: [
                              TextSpan(
                                  text:
                                      "By continuing you are agreeing to our \n",
                                  style: TextStyle(
                                      color: Colors.black,
                                      fontWeight: FontWeight.w400)),
                              TextSpan(
                                  text: "Terms & Conditions ",
                                  style: TextStyle(
                                      color: Colors.blue,
                                      fontWeight: FontWeight.w400)),
                              TextSpan(
                                  text: "and ",
                                  style: TextStyle(
                                      color: Colors.black,
                                      fontWeight: FontWeight.w400)),
                              TextSpan(
                                  text: "Privacy Policy",
                                  style: TextStyle(
                                      color: Colors.blue,
                                      fontWeight: FontWeight.w400)),
                            ]))
                          ],
                        ),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Widget LoginToggleButton() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // First Tab Button
        Expanded(
          child: GestureDetector(
            onTap: () => selectTab(0),
            child: Container(
              height: 30,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: selectedIndex == 0 ? const Color.fromARGB(255, 27, 78, 165) : Colors.white,
                borderRadius:
                    BorderRadius.horizontal(left: Radius.circular(12.0)),
                boxShadow: [BoxShadow(
                  color: Colors.grey.shade100,
                  blurRadius: 1,
                  spreadRadius: 3
                )]
              ),
              child: Text(
                "Student",
                style: TextStyle(
                  color: selectedIndex == 0 ? Colors.white : Colors.black54,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
        // Second Tab Button
        Expanded(
          child: GestureDetector(
            onTap: () => selectTab(1),
            child: Container(
              height: 30,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: selectedIndex == 1 ? const Color.fromARGB(255, 27, 78, 165) : Colors.white,
                borderRadius:
                    BorderRadius.horizontal(right: Radius.circular(12.0)),
                boxShadow: [BoxShadow(
                  color: Colors.grey.shade100,
                  blurRadius: 1,
                  spreadRadius: 3
                )]
              ),
              child: Text(
                "Parents",
                style: TextStyle(
                  color: selectedIndex == 1 ? Colors.white : Colors.black54,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
