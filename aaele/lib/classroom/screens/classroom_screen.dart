import 'dart:developer';

import 'package:aaele/Insights/controller/home_controller.dart';
import 'package:aaele/auth/screens/login_screen.dart';
import 'package:aaele/Insights/repository/home_repository.dart';
import 'package:aaele/classroom/screens/document_notes_screen.dart';
import 'package:aaele/classroom/widgets/subject_card.dart';
import 'package:aaele/constants/constants.dart';
import 'package:aaele/models/meeting_model.dart';
import 'package:aaele/permission_handler.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:shared_preferences/shared_preferences.dart';

class  ClassroomScreen extends ConsumerStatefulWidget {
  const ClassroomScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _ClassroomScreenState();
}

class _ClassroomScreenState extends ConsumerState<ClassroomScreen> {

  List<MeetingModel> allMeetings = [];
  String? userName = "";
  String notes = "";

  void getAllMeetings() async {
    HomeRepository homeRepository = HomeRepository();
    SharedPreferences prefs = await SharedPreferences.getInstance();
    int? studentId = prefs.getInt("student_id");
    userName = prefs.getString("name");
    // ignore: use_build_context_synchronously
    allMeetings = await homeRepository.getAllMeetings(context, studentId!);
    setState(() {});
  }

  void getNotesForMeeting(int meetId) async {
    final homeController = ref.read(homeControllerProvider.notifier);
    notes = await homeController.getNotesForMeeting(meetId);
  }

  void handlePermission() async {
  final allGranted = await PermissionHandler().requestAllPermissions();

  if (allGranted) {
    log("All permissions granted");
  } else {
    log("Permissions denied");
    // Optionally, show a dialog or message to the user
  }
}

  @override
  void initState() {
    super.initState();
    getAllMeetings();
    // handlePermission();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 20.0),
            child: IconButton(
              icon: const Icon(Icons.calendar_month_outlined),
              onPressed: () async {
                SharedPreferences prefs = await SharedPreferences.getInstance();
                prefs.remove("name");
                prefs.remove("student_id");
                // ignore: use_build_context_synchronously
                Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                    (Route<dynamic> route) => false);
              },
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Lectures",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              // GestureDetector(
              //   onTap: () {
              //     Navigator.of(context).push(MaterialPageRoute(
              //         builder: (context) => const InsightsScreen()));
              //   },
              //   child: const LectureCard(),
              // ),
              (allMeetings.isEmpty)
                  ? const Center(
                      child: SpinKitSpinningLines(color: Colors.blue, size: 60),
                    )
                  : ListView.builder(
                    scrollDirection: Axis.vertical,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: allMeetings.length,
                    itemBuilder: (context, index) {
                      return GestureDetector(
                        onTap: () {
                          getNotesForMeeting(allMeetings[index].meetId);
                          Navigator.of(context).push(MaterialPageRoute(
                              builder: (context) => DocumentNotesScreen(meetingModel: allMeetings[index], notes: notes)));
                        },
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 10.0),
                          child: SubjectCard(
                            name: allMeetings[index].title,
                            testBy: allMeetings[index].hostName,
                            description: allMeetings[index].description,
                            lecDisplayImage: Constants.lecDisplayImage[index%3],
                            color: Constants.subjectColors[index%5],
                          ),
                        ),
                      );
                    },
                  ),
            ],
          ),
        ),
      ),
    );
  }
}
