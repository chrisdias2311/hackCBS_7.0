import 'dart:developer';

import 'package:aaele/database.dart';
import 'package:aaele/permission_handler.dart';
import 'package:aaele/quiz/screens/assessments_display_screen.dart';
import 'package:aaele/classroom/screens/classroom_screen.dart';
import 'package:aaele/Insights/screens/attendance_screen.dart';
import 'package:animated_notch_bottom_bar/animated_notch_bottom_bar/animated_notch_bottom_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CustomBottomBar extends ConsumerStatefulWidget {
  final String role;
  const CustomBottomBar({super.key, required this.role});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _CustomBottomBarState();
}

class _CustomBottomBarState extends ConsumerState<CustomBottomBar> {
  int _page = 0;
  NotchBottomBarController notchBottomBarController =
      NotchBottomBarController();

  var screens = [];
  List<BottomBarItem> bottomBarItems = const [];

  void onPageChange(int page) {
    setState(() {
      _page = page;
    });
  }

  void authorizeRole() async {
    SharedPreferences sharedPreferences = await SharedPreferences.getInstance();
    ref.read(userRoleProvider.notifier).state =
        sharedPreferences.getString("role");
  }

  // void handlePermission() async {
  //   await PermissionHandler().cameraPermission();
  //   await PermissionHandler().micPermission();
  //   await PermissionHandler().storagePermission();
  // }

//   void handlePermission() async {
//   final allGranted = await PermissionHandler().requestAllPermissions();

//   if (allGranted) {
//     log("All permissions granted");
//   } else {
//     log("Permissions denied");
//     // Optionally, show a dialog or message to the user
//   }
// }

  @override
  void initState() {
    super.initState();
    authorizeRole();
    // handlePermission();
  }

  @override
  Widget build(BuildContext context) {
    screens = widget.role == "Student"
        ? [
            const ClassroomScreen(),
            const AssessmentsDisplayScreen(),
            const AttendanceScreen(),
          ]
        : [
            const AssessmentsDisplayScreen(),
            const AttendanceScreen(),
          ];
    bottomBarItems = widget.role == "Student"
        ? const [
            BottomBarItem(
              inActiveItem: Icon(
                Icons.home_rounded,
                color: Colors.blueGrey,
              ),
              activeItem: Icon(
                Icons.home_filled,
                color: Colors.blueAccent,
              ),
              itemLabel: 'Home',
            ),
            BottomBarItem(
              inActiveItem: Icon(
                Icons.book,
                color: Colors.blueGrey,
              ),
              activeItem: Icon(
                Icons.book,
                color: Colors.blueAccent,
              ),
              itemLabel: 'Test',
            ),
            BottomBarItem(
              inActiveItem: Icon(
                Icons.person,
                color: Colors.blueGrey,
              ),
              activeItem: Icon(
                Icons.person,
                color: Colors.blueAccent,
              ),
              itemLabel: 'Profile',
            )
          ]
        : const [
            BottomBarItem(
              inActiveItem: Icon(
                Icons.book,
                color: Colors.blueGrey,
              ),
              activeItem: Icon(
                Icons.book,
                color: Colors.blueAccent,
              ),
              itemLabel: 'Test',
            ),
            BottomBarItem(
              inActiveItem: Icon(
                Icons.person,
                color: Colors.blueGrey,
              ),
              activeItem: Icon(
                Icons.person,
                color: Colors.blueAccent,
              ),
              itemLabel: 'Profile',
            ),
          ];
    return Scaffold(
        body: screens[_page],
        // bottomNavigationBar: CupertinoTabBar(
        //   height: 60,
        //   border: const Border(top: BorderSide.none),
        //   activeColor: Colors.blue.shade800,
        //   backgroundColor: Colors.white,
        //   items: const [
        // BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: "Home"),
        // BottomNavigationBarItem(icon: Icon(Icons.book), label: "Classroom"),
        // BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        //   ],
        //   currentIndex: _page,
        //   onTap: onPageChange,
        // ),
        bottomNavigationBar: AnimatedNotchBottomBar(
          kBottomRadius: 10,
          kIconSize: 20,
          onTap: onPageChange,
          notchBottomBarController: notchBottomBarController,
          bottomBarItems: bottomBarItems,
        ));
  }
}
