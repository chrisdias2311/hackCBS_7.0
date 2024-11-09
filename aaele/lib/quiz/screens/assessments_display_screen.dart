import 'package:aaele/Insights/repository/home_repository.dart';
import 'package:aaele/classroom/widgets/subject_card.dart';
import 'package:aaele/constants/constants.dart';
import 'package:aaele/models/meeting_model.dart';
import 'package:aaele/quiz/screens/take_quiz_screen.dart';
import 'package:aaele/widgets/document_card.dart';
import 'package:aaele/widgets/snackbar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AssessmentsDisplayScreen extends ConsumerStatefulWidget {
  const AssessmentsDisplayScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _LecturesDisplayScreenState();
}

class _LecturesDisplayScreenState
    extends ConsumerState<AssessmentsDisplayScreen> {
  List<MeetingModel> allMeetings = [];
  String? userName = "";

  final ValueNotifier<int> selected = ValueNotifier<int>(0);

  void getAllMeetings() async {
    HomeRepository homeRepository = HomeRepository();
    SharedPreferences prefs = await SharedPreferences.getInstance();
    int? studentId = prefs.getInt("student_id");
    userName = prefs.getString("name");
    // ignore: use_build_context_synchronously
    allMeetings = await homeRepository.getAllMeetings(context, studentId!);
    setState(() {});
  }

  @override
  void initState() {
    super.initState();
    getAllMeetings();
  }

  @override
  void dispose() {
    super.dispose();
    selected.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: const Text(
          "Assessments",
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 20.0),
            child: IconButton(
              icon: const Icon(Icons.calendar_month_outlined),
              onPressed: () async {
                featureComingSoonSnackBar(context);
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
              AssessmentToggleButton(),
              const SizedBox(height: 20),
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
                            // getNotesForMeeting(allMeetings[index].meetId);
                            Navigator.of(context).push(MaterialPageRoute(
                                builder: (context) => TakeQuizScreen()));
                          },
                          child: Padding(
                            padding: const EdgeInsets.only(bottom: 10.0),
                            // child: SubjectCard(
                            //   name: allMeetings[index].title,
                            //   testBy: allMeetings[index].hostName,
                            //   description: allMeetings[index].description,
                            //   lecDisplayImage:
                            //       Constants.lecDisplayImage[index % 3],
                            //   color: Constants.subjectColors[index % 5],
                            // ),
                            child: DocumentCard(),
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

  Widget AssessmentToggleButton() {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [Colors.green.shade100, Colors.white],
                center: Alignment.center,
                radius:
                    3.3, // Adjust radius to control the white spread to the corners
                stops: const [0.7, 1.0], // White will appear towards the edges
              ),
              borderRadius: BorderRadius.circular(20)),
          height: 60,
          width: double.infinity,
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 5),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey.shade400, width: 1.2)),
          height: 50,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              GestureDetector(
                onTap: () {
                  selected.value = 0;
                },
                child: ValueListenableBuilder<int>(
                  valueListenable: selected,
                  builder: (context, value, _) {
                    return GestureDetector(
                      onTap: () {
                        selected.value = 0; // Update the selected value
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            vertical: 7, horizontal: 20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          color:
                              value == 0 ? Colors.grey.shade300 : Colors.white,
                        ),
                        child: Text(
                          "Live Assessments",
                          style: TextStyle(fontWeight: FontWeight.bold, color: value == 0 ? Colors.black : Colors.black54),
                        ),
                      ),
                    );
                  },
                ),
              ),
              ValueListenableBuilder<int>(
                valueListenable: selected,
                builder: (context, value, _) {
                  return GestureDetector(
                    onTap: () {
                      selected.value = 1;
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 7, horizontal: 20),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: value == 1 ? Colors.grey.shade300 : Colors.white,
                      ),
                      child: Text(
                        "Past Assessments",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: value == 1 ? Colors.black : Colors.black54,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}
