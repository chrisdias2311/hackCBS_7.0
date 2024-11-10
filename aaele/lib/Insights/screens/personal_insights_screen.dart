// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'dart:math';

import 'package:aaele/Insights/widgets/piechart.dart';
import 'package:aaele/models/report_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../repository/home_repository.dart';

class PersonalInsightsScreen extends ConsumerStatefulWidget {
  final int meetingId;
  final String userName;
  const PersonalInsightsScreen({
    Key? key,
    required this.meetingId,
    required this.userName,
  }) : super(key: key);

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _PersonalInsightsScreenState();
}

class _PersonalInsightsScreenState
    extends ConsumerState<PersonalInsightsScreen> {
  List<Report> reports = [];
  void getPersonalReport() async {
    HomeRepository homeRepository = HomeRepository();
    SharedPreferences prefs = await SharedPreferences.getInstance();
    int? studentId = prefs.getInt("student_id");
    reports = await homeRepository.getPersonalReport(
        context, studentId!, widget.meetingId);
    calculateOverallEmotionPercentage(reports[0].textEmotions,
        reports[0].videoEmotions, reports[0].audioEmotions);
    setState(() {});
  }

  String finalOverallName = "";
  double finalOverallPercentage = 0.0;
  void calculateOverallEmotionPercentage(List<Emotion> textEmotions,
      List<Emotion> videoEmotions, List<Emotion> audiEmotions) {
    double maxValue = 0;
    int maxIndex = -1;
    int totalValue = 0;
    List<double> value = [
      textEmotions[0].happy + videoEmotions[0].happy + audiEmotions[0].happy,
      textEmotions[0].surprised +
          videoEmotions[0].surprised +
          audiEmotions[0].surprised,
      textEmotions[0].confused +
          videoEmotions[0].confused +
          audiEmotions[0].confused,
      textEmotions[0].bored + videoEmotions[0].bored + audiEmotions[0].bored,
      textEmotions[0].pnf + videoEmotions[0].pnf + audiEmotions[0].pnf
    ];
    for (int i = 0; i < value.length; i++) {
      totalValue += value[i].toInt();
      if (value[i] > maxValue) {
        maxIndex = i;
        maxValue = max(value[i], maxValue);
      }
    }
    switch (maxIndex) {
      case 0:
        finalOverallName = "Happy";
        break;
      case 1:
        finalOverallName = "Surprised";
        break;
      case 2:
        finalOverallName = "Confused";
        break;
      case 3:
        finalOverallName = "Bored";
        break;
      case 4:
        finalOverallName = "Person Not Found";
        break;
      default:
        break;
    }
    finalOverallPercentage = (maxValue / totalValue) * 100;
    setState(() {});
  }

  @override
  void initState() {
    super.initState();
    getPersonalReport();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.only(left: 8.0),
                child: Text(
                  reports.isEmpty ? "" : "${widget.userName} was present in this lecture with ${reports[0].presentPercentage.toString()}% presence",
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.only(left: 8.0),
                child: Text(
                  "$finalOverallName: ${finalOverallPercentage.round()}%",
                  style: const TextStyle(
                      fontSize: 32, fontWeight: FontWeight.w900),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(left: 8.0),
                child: Text("${widget.userName} seems to be $finalOverallName in this lecture",
                    style:
                        const TextStyle(fontSize: 15)),
              ),
              const SizedBox(height: 50),
              reports.isEmpty
                  ? const Center(
                      child: SpinKitSpinningLines(color: Colors.blue, size: 60),
                    )
                  : ((reports[0].textEmotions[0].bored == 0 &&
                          reports[0].textEmotions[0].happy == 0 &&
                          reports[0].textEmotions[0].confused == 0 &&
                          reports[0].textEmotions[0].surprised == 0 &&
                          reports[0].textEmotions[0].pnf == 0)
                      ? NoDataFound(emotionName: "Text Emotion")
                      : PieChartWidget(
                          emotionName: "Text Emotion",
                          emotions: reports[0].textEmotions,
                          sectionIndex: 0)),
              const SizedBox(height: 20),
              reports.isEmpty
                  ? const Center(
                      child: SpinKitSpinningLines(color: Colors.blue, size: 60),
                    )
                  : ((reports[0].videoEmotions[0].bored == 0 &&
                          reports[0].videoEmotions[0].happy == 0 &&
                          reports[0].videoEmotions[0].confused == 0 &&
                          reports[0].videoEmotions[0].surprised == 0 &&
                          reports[0].videoEmotions[0].pnf == 0)
                      ? const NoDataFound(emotionName: "Video Emotion")
                      : PieChartWidget(
                          emotionName: "Video Emotion",
                          emotions: reports[0].videoEmotions,
                          sectionIndex: 1)),
              const SizedBox(height: 20),
              reports.isEmpty
                  ? const Center(
                      child: SpinKitSpinningLines(color: Colors.blue, size: 60),
                    )
                  : ((reports[0].audioEmotions[0].bored == 0 &&
                          reports[0].audioEmotions[0].happy == 0 &&
                          reports[0].audioEmotions[0].confused == 0 &&
                          reports[0].audioEmotions[0].surprised == 0 &&
                          reports[0].audioEmotions[0].pnf == 0)
                      ? const NoDataFound(emotionName: "Audio Emotion")
                      : PieChartWidget(
                          emotionName: "Audio Emotion",
                          emotions: reports[0].audioEmotions,
                          sectionIndex: 2)),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
