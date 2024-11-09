import 'dart:math';

import 'package:aaele/Insights/controller/home_controller.dart';
import 'package:aaele/auth/repository/auth_repository.dart';
import 'package:aaele/classroom/screens/chatbot.dart';
import 'package:aaele/classroom/widgets/subject_card.dart';
import 'package:aaele/constants/constants.dart';
import 'package:aaele/models/meeting_model.dart';
import 'package:aaele/widgets/snackbar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:awesome_snackbar_content/awesome_snackbar_content.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class DocumentNotesScreen extends ConsumerStatefulWidget {
  final MeetingModel meetingModel;
  final String notes;
  const DocumentNotesScreen(
      {super.key, required this.meetingModel, required this.notes});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() =>
      _DocumentNotesScreenState();
}

class _DocumentNotesScreenState extends ConsumerState<DocumentNotesScreen> {
  int color = Random().nextInt(4);
  int image = Random().nextInt(3);

  @override
  Widget build(BuildContext context) {
    final notes = ref.watch(getNotesForMeeting(widget.meetingModel.meetId));

    return Scaffold(
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.only(left: 13.0),
          child: GestureDetector(
            child: const Icon(Icons.arrow_back_ios_new_rounded),
            onTap: () {
              Navigator.of(context).pop();
            },
          ),
        ),
        title: const Text(
          "Notes",
          style: TextStyle(
              fontSize: 22, fontWeight: FontWeight.bold, fontFamily: "Nunito"),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 20),
            NotesBy(),
            const SizedBox(height: 20),
            Flexible(
              fit: FlexFit.loose,
              child: Column(
                children: [
                  SubjectCard(
                    name: "",
                    testBy: "",
                    description: "",
                    color: Constants.subjectColors[color],
                    lecDisplayImage: Constants.lecDisplayImage[image],
                  ),
                  const SizedBox(height: 20),
                  TitleCard(widget.meetingModel, notes),
                  const SizedBox(height: 20),
                  NotesDisplay(notes, color),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
      // floatingActionButton: Container(
      //   margin: const EdgeInsets.only(bottom: 8, right: 8),
      //   height: 50,
      //   width: 50,
      //   decoration: BoxDecoration(
      //     borderRadius: BorderRadius.circular(50),
      //     color: Constants.subjectColors[color],
      //   ),
      //   child: Icon(Icons.chat),
      // )
    );
  }

  Widget NotesDisplay(AsyncValue<String> notes, int color) {
    return Container(
      child: notes.when(
        data: (notes) => Center(
          child: Text(
            notes,
            textAlign: TextAlign.justify,
            style: const TextStyle(
              fontSize: 16,
              color: Colors.black54,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        loading: () => Center(
          child: SpinKitPouringHourGlassRefined(
              color: Constants.subjectColors[color]),
        ),
        error: (error, stackTrace) => Center(
          child: Text('Error: $error'),
        ),
      ),
    );
  }

  Widget TitleCard(MeetingModel meetingModel, AsyncValue<String> notes) {
    return Row(
      children: [
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                meetingModel.title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  fontFamily: "Nunito",
                ),
              ),
              Text(
                meetingModel.description,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w400,
                  fontFamily: "Nunito",
                ),
              )
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context)
                    ..hideCurrentSnackBar()
                    ..showSnackBar(snackBar('On Snap!',
                        'Feature Coming soon! :)', ContentType.help));
                },
                child: Icon(
                  Icons.bookmark_border_rounded,
                  color: Colors.grey.shade500,
                  size: 25,
                ),
              ),
              const SizedBox(height: 15),
              notes.when(
                data: (notes) => GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => ChatbotScreen(
                          meetingTitle: widget.meetingModel.title,
                          notes: notes,
                          studentName: AuthRepository().userName,
                        ),
                      ),
                    );
                  },
                  child: Icon(Icons.chat_outlined,
                      color: Colors.grey.shade500, size: 25),
                ),
                loading: () => Icon(Icons.chat_outlined,
                      color: Colors.grey.shade300, size: 25),
                error: (error, stackTrace) => Center(
                  child: Text('Error: $error'),
                ),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget NotesBy() {
    return Row(
      children: [
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    height: 45,
                    width: 45,
                    decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(10)),
                    child: Icon(Icons.person_outline),
                  ),
                  const SizedBox(width: 15),
                  const Text(
                    "Notes by ",
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        fontFamily: "Nunito"),
                  ),
                  Text(
                    widget.meetingModel.hostName,
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        fontFamily: "Nunito"),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context)
                    ..hideCurrentSnackBar()
                    ..showSnackBar(snackBar('On Snap!',
                        'Feature Coming soon! :)', ContentType.help));
                },
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 8, horizontal: 13),
                  decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.grey.shade300,
                      ),
                      borderRadius: BorderRadius.circular(8)),
                  child: const Text(
                    "Message",
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w500,
                      fontFamily: "Nunito",
                      fontSize: 15,
                    ),
                  ),
                ),
              )
            ],
          ),
        ),
      ],
    );
  }
}
