// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../repository/home_repository.dart';
import 'overall_meeting_insights.dart';
import 'personal_insights_screen.dart';

class InsightsScreen extends ConsumerStatefulWidget {
  final int meetingId;
  final String userName;
  const InsightsScreen({
    super.key,
    required this.meetingId,
    required this.userName,
  });

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends ConsumerState<InsightsScreen> {
  int _currentpage = 0;
  String conclusion = "";

  Future<String> generateConclusion() async {
    HomeRepository homeRepository = HomeRepository();
    SharedPreferences refs = await SharedPreferences.getInstance();
    int? studentId = refs.getInt("student_id");
    return await homeRepository.generateConclusion(
        context, widget.meetingId, studentId!);
  }

  late Future<String> _conclusionFuture;

  @override
  void initState() {
    super.initState();
    // Assuming you have a function that fetches the conclusion asynchronously
    _conclusionFuture = generateConclusion();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          (_currentpage == 0)
              ? "${widget.userName}'s Insights"
              : "Classroom Insights",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
        ),
      ),
      body: DefaultTabController(
        length: 2,
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.max,
            children: [
              const SizedBox(
                height: 20,
              ),
              // Container(
              //   margin: const EdgeInsets.symmetric(horizontal: 20),
              //   child: Align(
              //     alignment: Alignment.topLeft,
              //     child: Text(
              //       "health",
              //       // style: HeadingText,
              //     ),
              //   ),
              // ),
              Container(
                margin:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
                height: 50,
                decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                          color: Colors.grey.shade300,
                          blurRadius: 5,
                          spreadRadius: 5)
                    ],
                    borderRadius: BorderRadius.circular(20)),
                child: TabBar(
                  // indicatorSize: 100,
                  labelColor: Colors.white,
                  indicator: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: const Color.fromRGBO(14, 61, 154, 1)),
                  tabs: [
                    // Tab(
                    //   text: "viewReminders",
                    // ),
                    Tab(
                      // width: 300,
                      child: Center(child: Text("Personal insights")),
                    ),
                    Tab(
                      // width: 300,
                      child: Center(child: Text("Class insights")),
                    ),
                  ],
                  onTap: (index) {
                    _currentpage = index;
                    setState(() {});
                  },
                ),
              ),
              SizedBox(height: 8),
              Expanded(
                child: (_currentpage == 0)
                    ? PersonalInsightsScreen(
                        meetingId: widget.meetingId,
                        userName: widget.userName,
                      )
                    : OverallMeetingReports(
                        meetId: widget.meetingId,
                      ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: Container(
        padding: const EdgeInsets.all(5.0),
        height: 70,
        width: 150,
        child: FloatingActionButton(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          backgroundColor: Colors.white,
          onPressed: () {
            // generateConclusion();
            // (conclusion.length == 0) ? SizedBox() :
            // setState(() {});
            _showConclusionDialog(context);
          },
          child: ClipRRect(
            borderRadius: BorderRadius.circular(30),
            child: const Text(
              "Mood Summary",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );
  }

  void _showConclusionDialog(BuildContext context) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      transitionDuration: const Duration(milliseconds: 700),
      transitionBuilder: (context, anim1, anim2, child) {
        return SlideTransition(
          position:
              Tween(begin: Offset(0, 1), end: Offset(0, 0)).animate(anim1),
          child: child,
        );
      },
      pageBuilder: (context, anim1, anim2) {
        return FutureBuilder<String>(
          future: _conclusionFuture,
          builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Center(child: SpinKitSpinningLines(color: Colors.blue, size: 60),);
            } else if (snapshot.hasData && snapshot.data!.isNotEmpty) {
              return Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  height: 500,
                  margin: const EdgeInsets.only(bottom: 0, left: 12, right: 12),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(40),
                      topRight: Radius.circular(40),
                    ),
                  ),
                  child: SizedBox.expand(
                    child: Center(
                      child: SingleChildScrollView(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            children: [
                              Text(
                                "${widget.userName}'s mood summary",
                                style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 26,
                                    fontWeight: FontWeight.w800,
                                    decoration: TextDecoration.none),
                              ),
                              SizedBox(height: 30),
                              Text(
                                snapshot.data!,
                                style: TextStyle(
                                    color: Colors.black,
                                    fontSize: 20,
                                    fontWeight: FontWeight.w500,
                                    decoration: TextDecoration.none),
                                textAlign: TextAlign.justify,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            } else {
              return AlertDialog(
                title: Text('No Conclusion'),
                content: Text('No conclusion available.'),
                actions: <Widget>[
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: Text('Close'),
                  ),
                ],
              );
            }
          },
        );
      },
    );
  }
}
