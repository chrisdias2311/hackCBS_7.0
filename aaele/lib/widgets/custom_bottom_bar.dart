import 'package:animated_notch_bottom_bar/animated_notch_bottom_bar/animated_notch_bottom_bar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CustomBottomBar extends ConsumerStatefulWidget {
  const CustomBottomBar({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _CustomBottomBarState();
}

class _CustomBottomBarState extends ConsumerState<CustomBottomBar> {
  int _page = 0;
  NotchBottomBarController notchBottomBarController =
      NotchBottomBarController();

  var screens = [];

  void onPageChange(int page) {
    setState(() {
      _page = page;
    });
  }

  @override
  Widget build(BuildContext context) {
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
          bottomBarItems: const [
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
              itemLabel: 'Book',
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
              itemLabel: 'Classroom',
            ),
          ],
        ));
  }
}
